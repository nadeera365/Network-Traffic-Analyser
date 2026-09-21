import { useEffect, useRef, useState } from "react";
import { MAX_BYTES, parseTrafficCsv } from "../../utils/parseTrafficCsv";
import "./TrafficInput.css";

export default function TrafficInput({ input, onInputChange, busy, error, onAnalyze, onClear }) {
  const [batch, setBatch] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [reading, setReading] = useState(false);
  const fileInput = useRef(null);
  const generation = useRef(0);
  useEffect(() => () => { generation.current += 1; }, []);

  async function selectFile(event) {
    const file = event.target.files?.[0];
    const current = ++generation.current;
    setBatch(null);
    setFileName("");
    setFileError("");
    onInputChange("");
    if (!file) { setReading(false); return; }
    setReading(true);
    try {
      if (!/\.csv$/i.test(file.name)) throw new Error("Choose a .csv file. Excel workbooks are not supported yet.");
      if (file.size > MAX_BYTES) throw new Error("File exceeds 1 MiB. Choose a smaller CSV.");
      const bytes = await file.arrayBuffer();
      if (current !== generation.current) return;
      let text;
      try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
      catch { throw new Error("Save the file as CSV UTF-8 and try again."); }
      const parsed = parseTrafficCsv(text);
      setBatch(parsed);
      setFileName(file.name);
      onInputChange(parsed.input);
    } catch (problem) {
      if (current === generation.current) setFileError(problem.message);
    } finally {
      if (current === generation.current) setReading(false);
    }
  }

  function clearFile() {
    generation.current += 1;
    setReading(false);
    setBatch(null);
    setFileName("");
    setFileError("");
    if (fileInput.current) fileInput.current.value = "";
    onClear();
  }

  return (
    <section className="panel input-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">01 / INPUT</p><h2>Upload traffic records</h2></div>
        <span className="subtle-tag">CSV</span>
      </div>
      <p className="panel-description" id="csv-help">
        Choose a comma-separated UTF-8 CSV with 41 feature columns and 1–100 records. Maximum file size: 1 MiB.
      </p>
      <form onSubmit={(event) => {
        if (!batch || reading || busy || !input) { event.preventDefault(); return; }
        onAnalyze(event);
      }}>
        <div className="csv-picker">
          <label htmlFor="traffic-file">Select a CSV file</label>
          <input ref={fileInput} id="traffic-file" type="file" accept=".csv,text/csv"
            aria-describedby="csv-help" disabled={busy} onChange={selectFile} />
          <p>The file is read in your browser. Records are sent for analysis only when you click Run analysis.</p>
        </div>
        <div role="status" className="csv-status">
          {reading ? "Reading and validating file…" : batch ? fileName + " · " + batch.records.length + " records ready" : ""}
        </div>
        {batch && <>
          {batch.ignored.length > 0 && <p className="csv-notice">Excluded from model input: {batch.ignored.join(", ")}.</p>}
          <details className="csv-preview" open>
            <summary>Preview · first {Math.min(5, batch.records.length)} records</summary>
            <div className="table-scroll" tabIndex={0} role="region" aria-label="Input preview">
              <table><thead><tr><th scope="col">Record</th><th scope="col">Protocol</th><th scope="col">Service</th><th scope="col">State</th><th scope="col">Duration</th><th scope="col">Source bytes</th></tr></thead>
                <tbody>{batch.records.slice(0, 5).map((row, index) => <tr key={index}>
                  <td>{index + 1}</td><td>{row.proto}</td><td>{row.service}</td><td>{row.state}</td><td>{row.dur}</td><td>{row.sbytes}</td>
                </tr>)}</tbody></table>
            </div>
            <p>Showing selected columns. All 41 features will be analyzed.</p>
          </details>
        </>}
        {(fileError || error) && <div className="error-message" role="alert">{fileError || error}</div>}
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={busy || reading || !batch || !input}>
            {busy ? "Analyzing records…" : "Run analysis →"}
          </button>
          <button className="secondary-button" type="button" disabled={busy} onClick={clearFile}>Clear</button>
        </div>
      </form>
    </section>
  );
}
