import axios from "axios";

export const API = import.meta.env?.VITE_API_BASE_URL || "/api";

export const getMeta = () => axios.get(`${API}/meta`).then(r => r.data);
export const postForecast = p => axios.post(`${API}/forecast`, p).then(r => r.data);
export const postDecide = p => axios.post(`${API}/decide`, p).then(r => r.data);
export const getPortScreen = cargoT =>
  axios.get(`${API}/port-screen`, {
    params: { cargo_t: cargoT }
  }).then(r => r.data);
export const getBacktest = () => axios.get(`${API}/backtest`).then(r => r.data);
export const postTimeMachine = p => axios.post(`${API}/time-machine`, p).then(r => r.data);

export const fmtUsd = (v, digits = 0) =>
  `$${Number(v || 0).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })}`;

export const fmtT = v => `${Number(v || 0).toLocaleString("en-US")} t`;
export const fmtPct = (v, digits = 1) => `${Number(v || 0).toFixed(digits)}%`;
export const fmtRate = v => `$${Number(v || 0).toFixed(2)}`;
