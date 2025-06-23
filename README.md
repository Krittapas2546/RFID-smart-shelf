import socket
import json

# --- ตั้งค่า Server ---
HOST = '0.0.0.0'  # อนุญาตการเชื่อมต่อจากทุก IP ในเครือข่าย
PORT = 65432      # Port ที่จะเปิดรอรับข้อมูล (เลือกเลขที่สูงๆ เพื่อไม่ให้ซ้ำกับโปรแกรมอื่น)
# --------------------

# สร้าง Socket object
# AF_INET คือใช้ IPv4, SOCK_STREAM คือใช้ TCP
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT)) # เปิด Port ที่กำหนด
    s.listen()           # เริ่มรอการเชื่อมต่อ
    
    print(f"✅ Server เริ่มทำงานแล้วที่ Port {PORT}")
    print("   กำลังรอรับข้อมูล Job...")

    while True: # วนลูปเพื่อรับ Job ใหม่ๆ ได้เรื่อยๆ
        conn, addr = s.accept() # รับการเชื่อมต่อใหม่ (โปรแกรมจะหยุดรอตรงนี้จนกว่า Client จะเชื่อมต่อเข้ามา)
        with conn:
            print(f"\n🔌 ได้รับการเชื่อมต่อจาก {addr}")

            data_bytes = conn.recv(1024) # รับข้อมูล (ขนาดสูงสุด 1024 bytes)
            if not data_bytes:
                print("   Client ตัดการเชื่อมต่อโดยไม่ส่งข้อมูล")
                continue

            # แปลงข้อมูล bytes กลับเป็น string แล้วแปลงเป็น Python dictionary
            try:
                job_data_str = data_bytes.decode('utf-8')
                job_data = json.loads(job_data_str)

                print("✅ ได้รับข้อมูล Job ใหม่:")
                print(f"  Action: {job_data.get('action')}")
                print(f"  Lot No: {job_data.get('lot_no')}")
                print(f"  From: {job_data.get('from_loc')}")
                print(f"  Employee ID: {job_data.get('employee_id')}")
                print(f"  Task Location: Row {job_data.get('task_location_row')}, Col {job_data.get('task_location_col')}")
                
                # ส่งข้อความยืนยันกลับไปหา Client
                confirmation_message = "Job Received Successfully".encode('utf-8')
                conn.sendall(confirmation_message)

            except json.JSONDecodeError:
                print("❌ ไม่สามารถแปลงข้อมูลที่ได้รับเป็น JSON ได้")
                error_message = "Invalid JSON format".encode('utf-8')
                conn.sendall(error_message)
            except Exception as e:
                print(f"❌ เกิดข้อผิดพลาด: {e}")
                error_message = f"An error occurred: {e}".encode('utf-8')
                conn.sendall(error_message)
            
            print("\n...กลับไปรอรับข้อมูล Job ต่อไป...")
