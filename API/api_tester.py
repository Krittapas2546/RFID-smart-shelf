import socket
import json
import time
import random

pi_host_ip = '192.168.0.39'
def send_job_to_pi(job_data, host= pi_host_ip, port=65432):
    """
    Connects to the Raspberry Pi server and sends job data.
    """
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client_socket:
            print(f"📡 Connecting to {host}:{port}...")
            client_socket.connect((host, port))
            print("✅ Connected.")

            # Convert dictionary to JSON string and encode to bytes
            message = json.dumps(job_data).encode('utf-8')

            print(f"📤 Sending Job Data:\n{json.dumps(job_data, indent=4)}")
            client_socket.sendall(message)
            print("✔️ Data sent successfully.")

    except ConnectionRefusedError:
        print(f"❌ Connection refused. Is the server script running on {host}?")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # --- สร้างข้อมูลตามโครงสร้าง JSON ใหม่ ---
    # คุณสามารถแก้ไขค่าต่างๆ ที่นี่ก่อนรันสคริปต์
    job_to_send = {
        "action": "PUT",
        "status": "Waiting",
        "lotNo": f"LOT-{random.randint(1000, 9999)}",
        "from": "Station-A",
        "employeeId": "2025014",
        "location": {
    
            "row": random.randint(1, 4),
            "col": random.randint(1, 6)
        },
        "PositionSTK": [
            [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0],
            [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0],
            [31, 0], [32, 0], [33, 0], [34, 0], [35, 0], [36, 0],
            [41, 0], [42, 0], [43, 0], [44, 0], [45, 0], [46, 0]
        ],
        "timestamp": time.strftime("%H:%M:%S"),
        "error": None
    }

    

    send_job_to_pi(job_to_send, host=pi_host_ip)
