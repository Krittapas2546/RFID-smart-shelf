import socket
import json
import multiprocessing
from queue import Empty
import tkinter as tk

# ==============================================================================
# 1. Server Process: รับข้อมูลจาก Client แล้วส่งเข้า Queue
# ==============================================================================
def server_process(job_queue):
    host = '0.0.0.0'  # ฟังจากทุก network interface
    port = 65432

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((host, port))
        s.listen()
        print(f"✅ Server listening on {host}:{port}")

        while True:
            conn, addr = s.accept()
            with conn:
                print(f"🤝 Connected by {addr}")
                data = conn.recv(4096) # เพิ่มขนาด buffer เผื่อ JSON ใหญ่ขึ้น
                if not data:
                    continue

                try:
                    # แปลงข้อมูล bytes ที่ได้รับให้เป็น Python Dictionary
                    job_data = json.loads(data.decode('utf-8'))
                    print("📥 Received Full Job Data:")
                    # ใช้ json.dumps เพื่อ print dict สวยๆ ใน console
                    print(json.dumps(job_data, indent=2))
                    # ใส่ Job ทั้งหมดลงใน Queue เพื่อให้ UI นำไปใช้
                    job_queue.put(job_data)
                except json.JSONDecodeError:
                    print("⚠️ Received invalid JSON data.")
                except Exception as e:
                    print(f"An error occurred in server process: {e}")


# ==============================================================================
# 2. UI Process: สร้างหน้าจอและอัปเดตข้อมูลจาก Queue
# ==============================================================================
def ui_process(job_queue):
    root = tk.Tk()
    root.title("Automated Warehouse Shelf - Detailed View")
    root.geometry("1600x900")

    rows, cols = 5, 10
    shelf_labels = [[None for _ in range(cols)] for _ in range(rows)]

    for r in range(rows):
        for c in range(cols):
            frame = tk.Frame(root, width=150, height=100, borderwidth=1, relief="solid")
            frame.grid(row=r, column=c, padx=5, pady=5)
            frame.pack_propagate(False)

            details_label = tk.Label(
                frame,
                text=f"({r},{c})\nEmpty",
                font=("Arial", 8),
                justify=tk.LEFT,
                wraplength=140
            )
            details_label.pack(fill="both", expand=True, padx=2, pady=2)
            shelf_labels[r][c] = {'details': details_label}

    def check_for_jobs():
        try:
            job = job_queue.get_nowait()
            print(f"🎨 UI updating with data: {job}")

            # --- จุดสำคัญ: อ่านตำแหน่งจาก object 'location' ---
            location_data = job.get("location")

            if isinstance(location_data, dict):
                row = location_data.get("row")
                col = location_data.get("col")

                if isinstance(row, int) and isinstance(col, int) and (0 <= row < rows and 0 <= col < cols):
                    # --- สร้างข้อความจาก Key-Value ใน Job ---
                    details_text = ""
                    for key, value in job.items():
                        # ไม่ต้องแสดง object ที่ซับซ้อนหรือข้อมูลเยอะในช่องเล็กๆ
                        if key in ["location", "PositionSTK"]:
                            continue
                        details_text += f"{key}: {value}\n"
                    details_text = details_text.strip()

                    target_label = shelf_labels[row][col]['details']
                    target_label.config(
                        text=details_text,
                        fg="black",
                        bg="#e0e8ff" # เปลี่ยนสีพื้นหลังเพื่อเน้น
                    )
                else:
                    print(f"⚠️ Invalid location coordinates: (row={row}, col={col})")
            else:
                print(f"⚠️ Job is missing 'location' key or it's not a dictionary: {job}")

        except Empty:
            pass
        finally:
            root.after(100, check_for_jobs)

    print("✅ UI process started.")
    check_for_jobs()
    root.mainloop()


# ==============================================================================
# 3. ส่วนหลัก (Main)
# ==============================================================================
if __name__ == "__main__":
    print("🚀 Starting Main Application...")
    job_queue = multiprocessing.Queue()

    p_server = multiprocessing.Process(target=server_process, args=(job_queue,), daemon=True)
    p_ui = multiprocessing.Process(target=ui_process, args=(job_queue,))

    p_server.start()
    p_ui.start()

    p_ui.join()
    print("UI process finished. Exiting application.")
