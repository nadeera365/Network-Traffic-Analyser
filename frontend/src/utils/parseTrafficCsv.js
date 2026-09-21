import Papa from "papaparse";

export const MAX_BYTES = 1024 * 1024;
export const FEATURES = "dur proto service state spkts dpkts sbytes dbytes rate sttl dttl sload dload sloss dloss sinpkt dinpkt sjit djit swin stcpb dtcpb dwin tcprtt synack ackdat smean dmean trans_depth response_body_len ct_srv_src ct_state_ttl ct_dst_ltm ct_src_dport_ltm ct_dst_sport_ltm ct_dst_src_ltm ct_ftp_cmd ct_flw_http_mthd ct_src_ltm ct_srv_dst is_sm_ips_ports".split(" ");
const CATEGORIES = new Set(["proto", "service", "state"]);
const METADATA = new Set(["id", "label", "attack_cat", "is_ftp_login"]);
const NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

export function parseTrafficCsv(text) {
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw new Error("CSV exceeds 1 MiB.");
  if (text.includes("\u0000")) throw new Error("Use a UTF-8 CSV file.");
  const parsed = Papa.parse(text.replace(/^\uFEFF/, ""), {
    header: false, delimiter: ",", skipEmptyLines: true, preview: 102,
  });
  if (parsed.errors.length) throw new Error("Malformed CSV. Check quotation marks and separators.");
  const [rawHeaders, ...rows] = parsed.data;
  if (!rawHeaders || !rows.length) throw new Error("CSV must contain a header and at least one record.");
  if (rows.length > 100 || parsed.meta.truncated) throw new Error("Maximum 100 records per file. No rows have been analyzed.");
  const headers = rawHeaders.map((value) => value.trim());
  if (headers.some((value) => !value) || new Set(headers).size !== headers.length) throw new Error("Column names must be non-empty and unique.");
  const missing = FEATURES.filter((name) => !headers.includes(name));
  if (missing.length) throw new Error("Missing columns: " + missing.join(", "));
  const unknown = headers.filter((name) => !FEATURES.includes(name) && !METADATA.has(name));
  if (unknown.length) throw new Error("Unexpected columns: " + unknown.join(", "));
  const ignored = headers.filter((name) => METADATA.has(name));
  const indices = FEATURES.map((name) => headers.indexOf(name));
  const records = rows.map((row, index) => {
    const prefix = "Record " + (index + 1) + ": ";
    if (row.length !== headers.length) throw new Error(prefix + "column count does not match the header.");
    return Object.fromEntries(FEATURES.map((name, column) => {
      const value = row[indices[column]].trim();
      if (CATEGORIES.has(name)) {
        const controlCharacter = [...value].some((char) => char.codePointAt(0) < 32 || char.codePointAt(0) === 127);
        if (!value || [...value].length > 64 || controlCharacter) throw new Error(prefix + name + " must be non-empty text, at most 64 characters.");
        return [name, value];
      }
      const number = Number(value);
      if (!NUMBER.test(value) || !Number.isFinite(number) || number < 0) throw new Error(prefix + name + " must be a finite, non-negative number.");
      return [name, number];
    }));
  });
  const input = JSON.stringify({ records });
  if (new TextEncoder().encode(input).length > MAX_BYTES) throw new Error("Converted request exceeds 1 MiB. Choose fewer records.");
  return { input, records, ignored };
}
