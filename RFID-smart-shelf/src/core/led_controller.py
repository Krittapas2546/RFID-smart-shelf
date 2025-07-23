# core/led_controller.py
"""
Module สำหรับควบคุม LED (Pi5Neo) หรือ mock สำหรับ dev
"""

try:
    from pi5neo import Pi5Neo
    NUM_LEVEL, NUM_BLOCK = 4, 6
    NUM_PIXELS = NUM_LEVEL * NUM_BLOCK
    neo = Pi5Neo('/dev/spidev0.0', NUM_PIXELS, 800)
    def idx(level, block):
        return (level-1) * NUM_BLOCK + (block-1)
    def set_led(level, block, r, g, b):
        neo.clear_strip()
        neo.set_led_color(idx(level, block), r, g, b)
        neo.update_strip()
        return {"ok": True, "index": idx(level, block)}
except ImportError:
    def set_led(level, block, r, g, b):
        print(f"[MOCK] Would light LED at level {level}, block {block}, color=({r},{g},{b})")
        return {"ok": True, "index": (level-1)*6+(block-1), "mock": True}

def clear_all_leds():
    if 'neo' in globals() and neo:
        neo.clear_strip()
        neo.update_strip()
    else:
        print("[MOCK] Would clear all LEDs")
