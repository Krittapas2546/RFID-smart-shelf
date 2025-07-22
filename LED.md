ได้เลยครับ นี่คือสรุปขั้นตอนการติดตั้งและใช้งาน NeoPixels บน Raspberry Pi 5 โดยใช้ไลบรารี่ใหม่ผ่าน PIO พร้อมทั้งเพิ่มขั้นตอนการสร้าง Virtual Environment (env) เข้าไปด้วย

สรุปขั้นตอนการใช้งาน NeoPixels บน Raspberry Pi 5
โดยปกติแล้ว การใช้ NeoPixels บน Pi 5 จะต้องทำผ่านพอร์ต SPI ทำให้ไม่สามารถใช้อุปกรณ์ SPI อื่นๆ พร้อมกันได้ แต่วิธีการใหม่นี้จะใช้ความสามารถของชิป RP1 ที่เรียกว่า PIO (Programmable I/O) ซึ่งเป็นฮาร์ดแวร์ที่ออกแบบมาสำหรับงานประเภทนี้โดยเฉพาะ ทำให้พอร์ต SPI ของคุณยังคงว่างอยู่ 💡

สิ่งสำคัญ: วิธีนี้จำเป็นต้องอัปเดตเฟิร์มแวร์ของ Pi ซึ่งโดยทั่วไปจะไม่แนะนำหากไม่จำเป็น เพราะอาจยังไม่ผ่านการทดสอบอย่างละเอียดเท่าเวอร์ชันทางการ

1. สร้างและเปิดใช้งาน Virtual Environment (env)
ก่อนติดตั้งไลบรารี่ต่างๆ เราควรสร้างสภาพแวดล้อมเสมือน (Virtual Environment) เพื่อแยกไลบรารี่ของโปรเจกต์นี้ออกจากระบบหลักของ Pi จะได้ไม่ตีกันครับ

สร้าง env (ทำครั้งเดียวในโฟลเดอร์โปรเจกต์ของคุณ):

Bash

python3 -m venv .venv
เปิดใช้งาน env (ต้องทำทุกครั้งที่เปิด Terminal ใหม่เพื่อทำงานกับโปรเจกต์นี้):

Bash

source .venv/bin/activate
เมื่อเปิดใช้งานแล้ว คุณจะเห็น (.venv) นำหน้าชื่อพร้อมท์ใน Terminal

2. อัปเดตเฟิร์มแวร์ (Firmware)
ขั้นตอนนี้จำเป็นเพื่อให้ Kernel ของระบบปฏิบัติการรู้จักและอนุญาตให้เข้าถึง PIO ได้

ตรวจสอบว่าต้องอัปเดตหรือไม่ โดยพิมพ์คำสั่ง:

Bash

ls -l /dev/pio0
ถ้าขึ้นว่า no such file or directory แสดงว่าคุณต้องอัปเดตเฟิร์มแวร์

เริ่มการอัปเดต ด้วยคำสั่งต่อไปนี้:

Bash

sudo apt update
sudo apt upgrade -y
sudo rpi-eeprom-update -a
รีบูตเครื่องเพื่อให้การอัปเดตสมบูรณ์:

Bash

sudo reboot
3. ติดตั้งไลบรารี่หลัก
หลังจากรีบูตและเปิดใช้งาน env อีกครั้ง ให้ติดตั้งไลบรารี่สำหรับควบคุม NeoPixel ผ่าน PIO

ตรวจสอบว่าเปิดใช้งาน env แล้ว ((.venv) ต้องอยู่หน้าพร้อมท์)

ติดตั้งไลบรารี่ ด้วยคำสั่ง pip:

Bash

pip install Adafruit-Blinka-Raspberry-Pi5-Neopixel
4. ตั้งค่าสิทธิ์การเข้าถึง (Permissions) ⚙️
เพื่อให้ User ของเราสามารถเรียกใช้งาน PIO ได้โดยไม่ต้องใช้ sudo ทุกครั้ง เราต้องตั้งค่า permission ให้ถูกต้อง

ตรวจสอบสิทธิ์ปัจจุบัน ด้วยคำสั่งเดิม:

Bash

ls -l /dev/pio0
หากผลลัพธ์แสดงว่าเจ้าของ (owner) และกลุ่ม (group) เป็น root ทั้งคู่ เราต้องแก้ไข

เพิ่มกฎ (rule) ใหม่ เพื่อกำหนดสิทธิ์:

Bash

sudo nano /etc/udev/rules.d/99-com.rules
เพิ่มบรรทัดนี้เข้าไปในไฟล์ที่เปิดขึ้นมา:

SUBSYSTEM=="*-pio", GROUP="gpio", MODE="0660"
จากนั้นกด Ctrl+X แล้วกด Y และ Enter เพื่อบันทึก

รีบูตอีกครั้งเพื่อให้กฎใหม่มีผล:

Bash

sudo reboot
เมื่อกลับมาแล้วลองใช้คำสั่ง ls -l /dev/pio0 อีกครั้ง จะเห็นว่า group เปลี่ยนเป็น gpio แล้ว ✅

5. ทดสอบด้วยโค้ดตัวอย่าง 🚀
เปิดใช้งาน env อีกครั้ง (source .venv/bin/activate)

ดาวน์โหลดโค้ดตัวอย่าง:

Bash

wget https://raw.githubusercontent.com/adafruit/Adafruit_Blinka_Raspberry_Pi5_Neopixel/refs/heads/main/examples/led_animation.py
ติดตั้งไลบรารี่เพิ่มเติมที่โค้ดตัวอย่างต้องใช้:

Bash

pip install adafruit-circuitpython-pixelbuf adafruit-circuitpython-led-animation
แก้ไขโค้ด (ถ้าจำเป็น): เปิดไฟล์ led_animation.py ขึ้นมา คุณอาจต้องแก้ไขค่าต่างๆ ให้ตรงกับฮาร์ดแวร์ของคุณ เช่น:

Pin ที่ต่อ: โค้ดตัวอย่างใช้ D13

number_of_pixels: จำนวนเม็ด LED ของคุณ

byteorder: ชนิดของ NeoPixel (เช่น GRB, GRBW)

รันโค้ดตัวอย่าง:

Bash

python led_animation.py
ถ้าทุกอย่างถูกต้อง ไฟ NeoPixel ของคุณก็จะเริ่มแสดงแอนิเมชันตามโค้ดตัวอย่างครับ 🎉