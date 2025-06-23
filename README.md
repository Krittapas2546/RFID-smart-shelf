import asyncio
import websockets
import json
import http.server
import socketserver
import threading
import time
from datetime import datetime

# --- WebSocket Server Configuration ---
WS_PORT = 8765
CONNECTED_BROWSERS = set()
print(f"WebSocket จะรอการเชื่อมต่อที่ Port {WS_PORT}")

# ฟังก์ชันสำหรับส่งข้อมูลไปยัง Browser ทุกตัวที่เชื่อมต่ออยู่
async def broadcast(message):
    if CONNECTED_BROWSERS:
        # สร้าง task สำหรับส่งข้อมูลไปแต่ละ browser พร้อมๆ กัน
        await asyncio.wait([browser.send(message) for browser in CONNECTED_BROWSERS])

# ฟังก์ชันหลักที่จัดการการเชื่อมต่อแต่ละ client
async def handler(websocket, path):
    print(f"✅ Client เชื่อมต่อเข้ามา: {websocket.remote_address}")
    # ถ้าเป็น browser ให้เพิ่ม vào set
    if path == '/browser':
        CONNECTED_BROWSERS.add(websocket)
        print(f"🖥️  Browser เชื่อมต่อแล้ว ตอนนี้มี {len(CONNECTED_BROWSERS)} หน้าต่าง")
    
    try:
        # รอรับข้อมูลจาก client (เช่น job_client.py)
        async for message in websocket:
            print(f"📩 ได้รับข้อมูล: {message}")
            try:
                # ลองแปลงข้อมูลที่ได้รับเป็น JSON
                job_data = json.loads(message)
                
                # --- เพิ่มข้อมูล timestamp และแปลง location ---
                job_data['timestamp'] = datetime.now().strftime('%H:%M:%S')
                
                location_str = job_data.get("taskLocation", "") # "Row-1,Col-1"
                parts = location_str.replace('Row-', '').replace('Col-', '').split(',')
                if len(parts) == 2:
                    job_data['location'] = {'row': int(parts[0]), 'col': int(parts[1])}
                else:
                    job_data['location'] = None

                # แปลงกลับเป็น JSON String เพื่อส่งไปให้ Browser
                message_to_browser = json.dumps(job_data)
                
                # ส่งข้อมูลที่ได้รับไปยังทุก Browser ที่เชื่อมต่ออยู่
                await broadcast(message_to_browser)
                print(f"🚀 ส่งข้อมูลต่อไปยัง Browser {len(CONNECTED_BROWSERS)} ตัวเรียบร้อย")

            except json.JSONDecodeError:
                print("⚠️ ไม่สามารถแปลงข้อมูลเป็น JSON ได้")
            except Exception as e:
                print(f"เกิดข้อผิดพลาด: {e}")

    except websockets.exceptions.ConnectionClosed:
        print(f"❌ Client ตัดการเชื่อมต่อ: {websocket.remote_address}")
    finally:
        # ถ้า client ที่ตัดการเชื่อมต่อเป็น browser ให้นำออกจาก set
        if websocket in CONNECTED_BROWSERS:
            CONNECTED_BROWSERS.remove(websocket)
            print(f"🖥️  Browser ตัดการเชื่อมต่อ ตอนนี้เหลือ {len(CONNECTED_BROWSERS)} หน้าต่าง")


async def start_ws_server():
    # เริ่ม WebSocket server
    async with websockets.serve(handler, "0.0.0.0", WS_PORT):
        await asyncio.Future()  # รันไปเรื่อยๆ

# --- HTTP Server Configuration ---
HTTP_PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

def run_http_server():
    # สร้างและเริ่ม HTTP server ใน Thread แยก
    with socketserver.TCPServer(("", HTTP_PORT), Handler) as httpd:
        print(f"HTTP Server เริ่มทำงานที่ http://<Your-Pi-IP>:{HTTP_PORT}/shelf_ui.html")
        httpd.serve_forever()

# --- Main Execution ---
if __name__ == "__main__":
    print("▶️  กำลังเริ่ม Server...")
    
    # 1. เริ่ม HTTP Server ใน Thread แยก เพื่อไม่ให้ block การทำงานหลัก
    http_thread = threading.Thread(target=run_http_server)
    http_thread.daemon = True # ตั้งเป็น daemon เพื่อให้ปิดเองเมื่อโปรแกรมหลักปิด
    http_thread.start()

    # 2. เริ่ม WebSocket Server ใน Thread หลัก
    asyncio.run(start_ws_server())
