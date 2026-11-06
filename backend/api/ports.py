"""Port specification and feasibility screening endpoints."""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.schemas import PortDetail, PortFeasibilityResponse, PortsMatrixResponse
from backend.services import get_ports_dict, get_port_feasibility, get_ports_matrix

router = APIRouter(prefix="/ports", tags=["Ports"])


@router.get("", response_model=dict)
def list_ports():
    ports = get_ports_dict()
    return {"ports": ports}


@router.get("/matrix", response_model=PortsMatrixResponse)
def get_matrix(cargo_t: float = Query(default=150000.0, ge=1000.0, le=1000000.0)):
    return get_ports_matrix(cargo_t)


@router.get("/{port_name}", response_model=PortFeasibilityResponse)
def get_port(port_name: str, cargo_t: float = Query(default=150000.0, ge=1000.0, le=1000000.0)):
    try:
        return get_port_feasibility(port_name, cargo_t)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
