from pydantic import BaseModel
from typing import Optional

class JobRequest(BaseModel):
    lot_no: str
    level: str
    block: str
    place_flg: str
    # trn_status: str = "1"       
    # timestamp: Optional[str] = None 
    # error: Optional[dict] = None  

class ErrorRequest(BaseModel):
    errorLocation: dict