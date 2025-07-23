# core/led_controller.py
"""
Module สำหรับควบคุม LED (Pi5Neo) หรือ mock สำหรับ dev
"""

SHELF_CONFIG = {1: 6, 2: 6, 3: 6, 4: 6}
NUM_PIXELS = sum(SHELF_CONFIG.values())

def idx(level, block):
    return sum(SHELF_CONFIG[l] for l in range(1, level)) + (block-1)

try:
    from pi5neo import Pi5Neo
    neo = Pi5Neo('/dev/spidev0.0', NUM_PIXELS, 800)
    def set_led(level, block, r, g, b):
        neo.clear_strip()
        neo.set_led_color(idx(level, block), r, g, b)
        neo.update_strip()
        return {"ok": True, "index": idx(level, block)}
except ImportError:
    def set_led(level, block, r, g, b):
        print(f"[MOCK] Would light LED at level {level}, block {block}, color=({r},{g},{b})")
        return {"ok": True, "index": idx(level, block), "mock": True}

def clear_all_leds():
    if 'neo' in globals() and neo:
        neo.clear_strip()
        neo.update_strip()
    else:
        print("[MOCK] Would clear all LEDs")
