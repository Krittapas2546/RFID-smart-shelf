from pydantic import BaseModel, Field
from typing import Optional, List

class JobRequest(BaseModel):
    lot_no: str = Field(..., example="LOT123456")
    level: str = Field(..., example="1")
    block: str = Field(..., example="2")
    place_flg: str = Field(..., example="1")
    tray_count: str = Field(..., example="10")

class ErrorRequest(BaseModel):
    errorLocation: dict = Field(..., example={"level": 1, "block": 2, "message": "Wrong position scanned"})

class LEDPosition(BaseModel):
    position: str = Field(..., example="L1B1")
    r: int = Field(255, ge=0, le=255, example=255)
    g: int = Field(0, ge=0, le=255, example=0)
    b: int = Field(0, ge=0, le=255, example=0)

class LEDPositionRequest(BaseModel):
    position: str = Field(..., example="L1B1")
    r: int = Field(255, ge=0, le=255, example=255)
    g: int = Field(0, ge=0, le=255, example=0)
    b: int = Field(0, ge=0, le=255, example=0)

class LEDPositionsRequest(BaseModel):
    positions: List[LEDPosition] = Field(..., example=[
        {"position": "L1B1", "r": 255, "g": 0, "b": 0},
        {"position": "L1B2", "r": 0, "g": 255, "b": 0},
        {"position": "L2B1", "r": 0, "g": 0, "b": 255}
    ])

class LotCheckRequest(BaseModel):
    lot_no: str = Field(..., example="LOT123456")