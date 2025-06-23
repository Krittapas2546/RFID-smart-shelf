import tkinter as tk
import socket
import json
import multiprocessing
import time
from queue import Empty  # Import the Empty exception

# ==============================================================================
# 1. ส่วนของ Server (โปรแกรมรับข้อมูล)
#    - แก้ไขให้รับ queue เข้ามา
#    - เมื่อได้ข้อมูลแล้ว ให้ .put() ลงใน queue แทนการ print()
# ==============================================================================
def server_process(job_queue):
    """
    ฟังก์ชันนี้จะทำงานเป็น Process แยกเพื่อรอรับข้อมูล Job จาก Network
    แล้วส่งต่อไปยัง UI ผ่านทาง job_queue
    """
    host = '0.0.0.0'  # ฟังจากทุก Network Interface
    port = 65432

    # ใช้ with statement เพื่อให้แน่ใจว่า socket จะถูกปิดเสมอ
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((host, port))
        s.listen()
        print(f"✅ Server process started. Listening on {host}:{port}")

        while True: # วนลูปเพื่อรับการเชื่อมต่อใหม่ๆ ได้ตลอด
            try:
                conn, addr = s.accept()
                with conn:
                    print(f"🔌 Connected by {addr}")
                    data = conn.recv(1024)
                    if not data:
                        continue # ถ้าไม่มีข้อมูล ให้รอ connection ต่อไป

                    # แปลงข้อมูล bytes -> string -> dict
                    job_data = json.loads(data.decode('utf-8'))
                    print(f"📥 Received Job: {job_data['Lot No.']}")

                    # --- จุดสำคัญ: ส่งข้อมูล Job เข้า Queue ---
                    job_queue.put(job_data)

                    # ส่งการตอบกลับไปให้ Client
                    conn.sendall(b'Received')
            except Exception as e:
                print(f"💥 Server Error: {e}")
                time.sleep(1)


# ==============================================================================
# 2. ส่วนของ UI (โปรแกรมหน้าจอ)
#    - แก้ไขให้รับ queue เข้ามา
#    - สร้างฟังก์ชันสำหรับเช็ค queue และอัปเดตหน้าจอ
# ==============================================================================
def ui_process(job_queue):
    """
    ฟังก์ชันนี้จะทำงานเป็น Process แยกเพื่อสร้างและแสดงผลหน้าจอ UI
    และคอยดึงข้อมูลจาก job_queue มาอัปเดตหน้าจอ
    """
    root = tk.Tk()
    root.title("Automated Warehouse Shelf")
    root.geometry("800x600")

    rows, cols = 5, 10
    shelf_labels = [[None for _ in range(cols)] for _ in range(rows)]

    for r in range(rows):
        for c in range(cols):
            frame = tk.Frame(root, width=70, height=50, borderwidth=1, relief="solid")
            frame.grid(row=r, column=c, padx=5, pady=5)
            frame.pack_propagate(False) # ป้องกันไม่ให้ frame หดตาม label

            # สร้าง Label 2 บรรทัดสำหรับ Lot No. และ Status
            lot_label = tk.Label(frame, text=f"({r},{c})", font=("Arial", 8))
            lot_label.pack()
            status_label = tk.Label(frame, text="Empty", font=("Arial", 8), fg="grey")
            status_label.pack()

            shelf_labels[r][c] = {'lot': lot_label, 'status': status_label}

    # --- จุดสำคัญ: ฟังก์ชันสำหรับเช็ค Queue และอัปเดต UI ---
    def check_for_jobs():
        try:
            # ลองดึงข้อมูลจาก Queue แบบไม่ block (non-blocking)
            job = job_queue.get_nowait()

            print(f"🎨 UI updating for Lot: {job['Lot No.']}")

            # แยกข้อมูลตำแหน่ง "Row-1, Col-1" -> (0, 0)
            location_str = job.get("Task Location", "")
            parts = location_str.replace('Row-', '').replace('Col-', '').split(',')
            if len(parts) == 2:
                row, col = int(parts[0]), int(parts[1])

                # อัปเดต Label บนหน้าจอ
                if 0 <= row < rows and 0 <= col < cols:
                    target_labels = shelf_labels[row][col]
                    target_labels['lot'].config(text=f"Lot: {job['Lot No.']}", fg="black")
                    target_labels['status'].config(text=job['Status'], fg="blue")
                else:
                    print(f"⚠️ Invalid location: ({row},{col})")

        except Empty:
            # ถ้า Queue ว่างเปล่า ก็ไม่ต้องทำอะไร
            pass
        finally:
            # ตั้งเวลาให้กลับมาเช็คฟังก์ชันนี้อีกครั้งใน 100ms
            root.after(100, check_for_jobs)

    print("✅ UI process started.")
    check_for_jobs()  # เริ่มการตรวจสอบ Job ครั้งแรก
    root.mainloop()


# ==============================================================================
# 3. ส่วนหลัก (Main)
#    - สร้าง Queue
#    - สร้างและเริ่มการทำงานของทั้ง 2 Process
# ==============================================================================
if __name__ == "__main__":
    print("🚀 Starting Main Application...")

    # สร้าง "ตู้ไปรษณีย์กลาง"
    job_queue = multiprocessing.Queue()

    # สร้าง Process สำหรับ Server และส่ง queue เข้าไป
    p_server = multiprocessing.Process(target=server_process, args=(job_queue,))

    # สร้าง Process สำหรับ UI และส่ง queue เดียวกันเข้าไป
    p_ui = multiprocessing.Process(target=ui_process, args=(job_queue,))

    # เริ่มการทำงานของทั้งสอง Process
    p_server.start()
    p_ui.start()

    # รอให้ Process ทั้งสองทำงานจนจบ (ซึ่งในที่นี้คือไม่มีวันจบ)
    p_server.join()
    p_ui.join()
