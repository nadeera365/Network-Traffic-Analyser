import asyncio
import logging
from contextlib import asynccontextmanager
from threading import Lock
from uuid import uuid4

import pandas as pd
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from api.schemas import PredictionRequest
from src.predictor import NetGuardPredictor


logger = logging.getLogger("uvicorn.error")

MAX_BODY_BYTES = 1024 * 1024  # 1 MiB
BODY_TIMEOUT_SECONDS = 15


class RequestBodyLimitMiddleware:
    """Limit incoming body bytes before FastAPI parses JSON."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        body = bytearray()

        try:
            async with asyncio.timeout(BODY_TIMEOUT_SECONDS):
                while True:
                    message = await receive()

                    if message["type"] == "http.disconnect":
                        return

                    chunk = message.get("body", b"")

                    # Check actual bytes, not only Content-Length.
                    if len(body) + len(chunk) > MAX_BODY_BYTES:
                        response = JSONResponse(
                            status_code=413,
                            content={
                                "detail": "Request body exceeds 1 MiB."
                            },
                        )
                        await response(scope, receive, send)
                        return

                    body.extend(chunk)

                    if not message.get("more_body", False):
                        break

        except TimeoutError:
            response = JSONResponse(
                status_code=408,
                content={"detail": "Request body timed out."},
            )
            await response(scope, receive, send)
            return

        delivered = False

        async def replay_receive():
            nonlocal delivered

            if not delivered:
                delivered = True
                return {
                    "type": "http.request",
                    "body": bytes(body),
                    "more_body": False,
                }

            return await receive()

        await self.app(scope, replay_receive, send)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.predictor = NetGuardPredictor()
    app.state.prediction_lock = Lock()
    yield


app = FastAPI(
    title="NetGuard AI",
    version="0.1.0",
    debug=False,
    lifespan=lifespan,
)

app.add_middleware(RequestBodyLimitMiddleware)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    request: Request,
    error: RequestValidationError,
):
    # Do not echo submitted data or validation internals.
    return JSONResponse(
        status_code=422,
        content={
            "detail": (
                "Invalid request. Provide 1–100 records matching "
                "the TrafficRecord schema in /docs."
            )
        },
    )


@app.get("/health")
def health():
    return {"status": "ready", "models_loaded": 3}


@app.post("/predict")
def predict(payload: PredictionRequest, request: Request):
    prediction_lock = request.app.state.prediction_lock

    # Avoid running several expensive model calls simultaneously.
    if not prediction_lock.acquire(blocking=False):
        return JSONResponse(
            status_code=503,
            headers={"Retry-After": "2"},
            content={
                "detail": "Prediction service is busy. Try again shortly."
            },
        )

    try:
        records = pd.DataFrame(
            [record.model_dump() for record in payload.records]
        )

        results = request.app.state.predictor.predict(records)

        json_results = (
            results.astype(object)
            .where(pd.notna(results), None)
            .to_dict(orient="records")
        )

        return JSONResponse(
            content={
                "count": len(json_results),
                "predictions": json_results,
            },
            headers={"Cache-Control": "no-store"},
        )

    except Exception as error:
        error_id = uuid4().hex

        # Log an identifier and exception type, without raw traffic
        # values or exception messages that might contain input data.
        logger.error(
            "Prediction failed: error_id=%s exception_type=%s",
            error_id,
            type(error).__name__,
        )

        return JSONResponse(
            status_code=500,
            content={
                "detail": "Prediction failed.",
                "error_id": error_id,
            },
        )

    finally:
        prediction_lock.release()