import {
  MetadataResponse,
  PortFeasibilityResponse,
  PortsMatrixResponse,
  ForecastResponse,
  DecisionRequest,
  DecisionResponse,
  ReplayRequest,
  ReplayResponse,
  BacktestSummaryResponse,
  PortName,
  Origin,
  ShipClass
} from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.detail) errorMsg = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  async getMetadata(): Promise<MetadataResponse> {
    const res = await fetch(`${API_BASE}/metadata`);
    return handleResponse<MetadataResponse>(res);
  },

  async getPorts(): Promise<{ ports: Record<string, any> }> {
    const res = await fetch(`${API_BASE}/ports`);
    return handleResponse<{ ports: Record<string, any> }>(res);
  },

  async getPortDetail(portName: PortName, cargoT: number = 150000): Promise<PortFeasibilityResponse> {
    const res = await fetch(`${API_BASE}/ports/${encodeURIComponent(portName)}?cargo_t=${cargoT}`);
    return handleResponse<PortFeasibilityResponse>(res);
  },

  async getPortsMatrix(cargoT: number = 150000): Promise<PortsMatrixResponse> {
    const res = await fetch(`${API_BASE}/ports/matrix?cargo_t=${cargoT}`);
    return handleResponse<PortsMatrixResponse>(res);
  },

  async getForecast(origin: Origin, shipClass: ShipClass, asofDate?: string): Promise<ForecastResponse> {
    let url = `${API_BASE}/forecast?origin=${encodeURIComponent(origin)}&ship_class=${encodeURIComponent(shipClass)}`;
    if (asofDate) url += `&asof_date=${encodeURIComponent(asofDate)}`;
    const res = await fetch(url);
    return handleResponse<ForecastResponse>(res);
  },

  async analyseDecision(req: DecisionRequest): Promise<DecisionResponse> {
    const res = await fetch(`${API_BASE}/decision/analyse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    return handleResponse<DecisionResponse>(res);
  },

  async executeReplay(req: ReplayRequest): Promise<ReplayResponse> {
    const res = await fetch(`${API_BASE}/replay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    return handleResponse<ReplayResponse>(res);
  },

  async getBacktestSummary(): Promise<BacktestSummaryResponse> {
    const res = await fetch(`${API_BASE}/backtest/summary`);
    return handleResponse<BacktestSummaryResponse>(res);
  },

  async getMethodology(): Promise<any> {
    const res = await fetch(`${API_BASE}/methodology`);
    return handleResponse<any>(res);
  }
};
