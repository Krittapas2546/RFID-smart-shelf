import asyncio
import websockets
import json
import http.server
import socketserver
import threading

# --- HTTP Server ---
PORT = 8000

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="src/www", **kwargs)

def run_http_server():
    with socketserver.TCPServer(("", PORT), MyHttpRequestHandler) as httpd:
        print(f"HTTP Server เริ่มทำงานที่ http://<Your-Pi-IP>:{PORT}/shelf_ui.html")
        httpd.serve_forever()

# --- WebSocket Server ---
connected_clients = set()
queue = []
active_job = None

# FIX: แก้ไขฟังก์ชันให้รับพารามิเตอร์ 'path'
async def handler(websocket, path):
    global active_job
    print(f"✅ Client เชื่อมต่อแล้ว: {websocket.remote_address}")
    connected_clients.add(websocket)
    try:
        # ส่งข้อมูลทั้งหมดที่มีอยู่ (Queue และ Active Job) ให้ Client ที่เพิ่งต่อเข้ามาใหม่
        initial_data = {
            "type": "initial_state",
            "queue": queue,
            "activeJob": active_job
        }
        await websocket.send(json.dumps(initial_data))

        async for message in websocket:
            print(f"📥 ได้รับข้อมูล: {message}")
            try:
                data = json.loads(message)

                # --- ตรวจสอบว่าเป็นคำสั่งพิเศษจาก UI หรือไม่ ---
                if data.get("command") == "get_initial_state":
                    # UI ร้องขอข้อมูลเริ่มต้น (อาจจะไม่จำเป็นแล้ว แต่เก็บไว้ก่อน)
                    pass # การส่งข้อมูลเริ่มต้นทำไปแล้วตอนเชื่อมต่อ
                elif data.get("command") == "set_active":
                    job_lot_no = data.get("lotNo")
                    new_active_job = next((job for job in queue if job["lotNo"] == job_lot_no), None)
                    if new_active_job:
                        active_job = new_active_job
                        queue = [job for job in queue if job["lotNo"] != job_lot_no] # เอาออกจากคิว
                        update_message = {
                            "type": "update",
                            "queue": queue,
                            "activeJob": active_job
                        }
                        for client in connected_clients:
                            await client.send(json.dumps(update_message))
                elif data.get("command") == "back_to_queue":
                    if active_job:
                        queue.insert(0, active_job) # นำกลับไปไว้บนสุดของคิว
                        active_job = None
                        update_message = {
                            "type": "update",
                            "queue": queue,
                            "activeJob": active_job
                        }
                        for client in connected_clients:
                            await client.send(json.dumps(update_message))
                else:
                    # --- จัดการ Job ที่ส่งมาจาก Client (job_client.py) ---
                    new_job = data
                    # เพิ่ม timestamp และ location ที่แยกส่วนแล้ว
                    from datetime import datetime
                    new_job['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

                    # แยก taskLocation เป็น row/col
                    try:
                        location_str = new_job.get("taskLocation", "")
                        row_str, col_str = location_str.replace("Row-", "").replace("Col-", "").split(',')
                        new_job['location'] = {'row': int(row_str), 'col': int(col_str)}
                    except (ValueError, AttributeError):
                        new_job['location'] = None # หรือตั้งค่า default

                    # ถ้ายังไม่มี Active Job ให้ตั้งอันนี้เป็น Active เลย
                    if active_job is None:
                        active_job = new_job
                    else:
                        queue.append(new_job)

                    # สร้าง Message สำหรับส่งไปอัปเดต UI
                    update_message = {
                        "type": "update",
                        "queue": queue,
                        "activeJob": active_job
                    }

                    # ส่งข้อมูลอัปเดตไปยังทุก Client ที่เชื่อมต่ออยู่
                    for client in connected_clients:
                        await client.send(json.dumps(update_message))

            except json.JSONDecodeError:
                print("⚠️ ไม่สามารถถอดรหัส JSON ได้")
            except Exception as e:
                print(f"🚨 เกิดข้อผิดพลาดในการประมวลผลข้อความ: {e}")

    finally:
        connected_clients.remove(websocket)
        print(f"❌ Client ตัดการเชื่อมต่อ: {websocket.remote_address}")


async def main():
    print("▶️  กำลังเริ่ม Server...")
    # เริ่ม HTTP server ใน thread แยก
    http_thread = threading.Thread(target=run_http_server, daemon=True)
    http_thread.start()

    # เริ่ม WebSocket server
    print("WebSocket จะรอการเชื่อมต่อที่ Port 8765")
    async with websockets.serve(handler, "0.0.0.0", 8765):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⏹️  กำลังปิด Server...")
