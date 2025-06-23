(venv) pi@raspberrypi:~/Desktop/chokun/RFID-smart-shelf-Raspberry-Pi/RFID-smart-shelf/src $ uvicorn main:app --host 0.0.0.0 --port 8000
INFO:     Started server process [7717]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     127.0.0.1:47606 - "GET / HTTP/1.1" 200 OK
INFO:     127.0.0.1:50840 - "GET / HTTP/1.1" 200 OK
INFO:     192.168.0.18:54605 - "POST /api/update_shelf HTTP/1.1" 404 Not Found
INFO:     192.168.0.18:54610 - "POST /api/update_shelf HTTP/1.1" 404 Not Found
