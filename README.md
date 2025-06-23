(venv) pi@raspberrypi:~/Desktop/chokun/RFID-smart-shelf-Raspberry-Pi/RFID-smart-shelf $ kill -9 10084
(venv) pi@raspberrypi:~/Desktop/chokun/RFID-smart-shelf-Raspberry-Pi/RFID-smart-shelf $ python src/main.py
WebSocket จะรอการเชื่อมต่อที่ Port 8765
▶️  กำลังเริ่ม Server...
HTTP Server เริ่มทำงานที่ http://<Your-Pi-IP>:8000/shelf_ui.html
connection handler failed
Traceback (most recent call last):
  File "/home/pi/Desktop/chokun/RFID-smart-shelf-Raspberry-Pi/RFID-smart-shelf/venv/lib/python3.11/site-packages/websockets/asyncio/server.py", line 376, in conn_handler
    await self.handler(connection)
          ^^^^^^^^^^^^^^^^^^^^^^^^
TypeError: handler() missing 1 required positional argument: 'path'
