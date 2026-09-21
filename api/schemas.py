from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


# Accept finite, non-negative numbers; reject numeric strings and booleans.
NonNegativeNumber = Annotated[
    float,
    Field(strict=True, ge=0, allow_inf_nan=False),
]

# Allow unseen categories, but reject empty or excessively long text.
CategoryText = Annotated[
    str,
    StringConstraints(
        strict=True,
        strip_whitespace=True,
        min_length=1,
        max_length=64,
    ),
]


class TrafficRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    dur: NonNegativeNumber
    proto: CategoryText
    service: CategoryText
    state: CategoryText
    spkts: NonNegativeNumber
    dpkts: NonNegativeNumber
    sbytes: NonNegativeNumber
    dbytes: NonNegativeNumber
    rate: NonNegativeNumber
    sttl: NonNegativeNumber
    dttl: NonNegativeNumber
    sload: NonNegativeNumber
    dload: NonNegativeNumber
    sloss: NonNegativeNumber
    dloss: NonNegativeNumber
    sinpkt: NonNegativeNumber
    dinpkt: NonNegativeNumber
    sjit: NonNegativeNumber
    djit: NonNegativeNumber
    swin: NonNegativeNumber
    stcpb: NonNegativeNumber
    dtcpb: NonNegativeNumber
    dwin: NonNegativeNumber
    tcprtt: NonNegativeNumber
    synack: NonNegativeNumber
    ackdat: NonNegativeNumber
    smean: NonNegativeNumber
    dmean: NonNegativeNumber
    trans_depth: NonNegativeNumber
    response_body_len: NonNegativeNumber
    ct_srv_src: NonNegativeNumber
    ct_state_ttl: NonNegativeNumber
    ct_dst_ltm: NonNegativeNumber
    ct_src_dport_ltm: NonNegativeNumber
    ct_dst_sport_ltm: NonNegativeNumber
    ct_dst_src_ltm: NonNegativeNumber
    ct_ftp_cmd: NonNegativeNumber
    ct_flw_http_mthd: NonNegativeNumber
    ct_src_ltm: NonNegativeNumber
    ct_srv_dst: NonNegativeNumber
    is_sm_ips_ports: NonNegativeNumber


class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    records: list[TrafficRecord] = Field(
        min_length=1,
        max_length=100,
    )