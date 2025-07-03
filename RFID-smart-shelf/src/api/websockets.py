from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json

from core.database import DB # <-- import DB มาจากที่ใหม่

# --- Connection Manager for WebSockets ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()
router = APIRouter() # <-- สร้าง router สำหรับไฟล์นี้

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    initial_state = {"type": "initial_state", "payload": DB}
    await websocket.send_text(json.dumps(initial_state))
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)