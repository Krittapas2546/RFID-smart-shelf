import http.server
import socketserver
import json
import threading
import datetime

# --- ส่วนเก็บข้อมูลกลาง (Thread-Safe) ---
# List นี้จะเก็บ Job ทั้งหมดที่ถูกส่งเข้ามา
jobs_queue = []
jobs_lock = threading.Lock()

# --- ตั้งค่า Server ---
PORT = 8000
# ใช้ 0.0.0.0 เพื่อให้ Server รับการเชื่อมต่อจากทุก IP ในเครือข่าย
HOST = '0.0.0.0'

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    คลาสสำหรับจัดการ HTTP Request ที่เข้ามา
    """
    def do_GET(self):
        # ถ้า client ขอ path หลัก ('/') ให้ส่งไฟล์ shelf_ui.html กลับไป
        if self.path == '/':
            self.path = '/shelf_ui.html'
            return http.server.SimpleHTTPRequestHandler.do_GET(self)

        # ถ้าหน้า UI (JavaScript) ขอข้อมูล Job ล่าสุด
        if self.path == '/api/jobs':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            with jobs_lock:
                # ส่งข้อมูลใน jobs_queue กลับไปในรูปแบบ JSON
                self.wfile.write(json.dumps(jobs_queue).encode('utf-8'))
            return
        
        # สำหรับ request อื่นๆ ให้ทำงานตามปกติ (เช่น โหลดไฟล์ CSS/JS ถ้ามี)
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        # ถ้า client ส่งข้อมูล Job ใหม่เข้ามา
        if self.path == '/api/jobs':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                job_data = json.loads(post_data.decode('utf-8'))
                print(f"✅ Received Job: {job_data.get('lotNo')}")

                # เพิ่ม timestamp และใส่ข้อมูลลงใน queue
                with jobs_lock:
                    job_data['timestamp'] = datetime.datetime.now().strftime("%H:%M:%S")
                    jobs_queue.append(job_data)
                
                # ตอบกลับ client ว่าได้รับข้อมูลแล้ว
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {'status': 'success', 'message': 'Job received'}
                self.wfile.write(json.dumps(response).encode('utf-8'))

            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON received")
            return
            
        self.send_error(404, "Not Found")

# --- ส่วนสำหรับรันโปรแกรม ---
if __name__ == "__main__":
    # ตรวจสอบว่าไฟล์ shelf_ui.html อยู่ในโฟลเดอร์เดียวกันหรือไม่
    try:
        with open("shelf_ui.html", "r", encoding="utf-8") as f:
            pass
        print("✔️  'shelf_ui.html' found.")
    except FileNotFoundError:
        print("❌ ERROR: 'shelf_ui.html' not found.")
        print("Please save the HTML file in the same directory as this script.")
        exit()

    with socketserver.TCPServer((HOST, PORT), RequestHandler) as httpd:
        print(f"\n🚀 Server starting at http://{HOST}:{PORT}")
        print("   To view the UI, open a browser to http://<YOUR_PI_IP_ADDRESS>:8000")
        print("   Run 'hostname -I' in the Pi's terminal to find the IP address.")
        print("   Press Ctrl+C to stop the server.")
        httpd.serve_forever()
