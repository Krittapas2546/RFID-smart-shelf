import time
from pi5neo import Pi5Neo

NUMLEVEL, NUMBLOCK = 4, 6
NUMPIXELS = NUMLEVEL * NUMBLOCK

neo = Pi5Neo('/dev/spidev0.0', NUMPIXELS, 800)   # SPI0 CE0, 800 kHz

def led_index(level, block):
    return level * NUMBLOCK + block              # 0-based mapping

def light_one(level, block, color=(0, 255, 0), duration=1):
    neo.clear_strip()                            # ดับทุกดวง
    idx = led_index(level, block)
    neo.set_led_color(idx, *color)               # ติดดวงเป้าหมาย
    neo.update_strip()                           # ส่งข้อมูลไป LED
    time.sleep(duration)

# ทดสอบไล่ทีละบล็อก
for lvl in range(NUMLEVEL):
    for blk in range(NUMBLOCK):
        light_one(lvl, blk, (255, 0, 0), 0.2)
