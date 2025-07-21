Raspberry Pi with Addressable LED Strip
1
2
3
Addressable LED strips, like WS2812B, allow individual control of each LED for creating dynamic lighting effects. Here's how to set up and control them using a Raspberry Pi.

Hardware Setup

Components Needed: Raspberry Pi (e.g., Pi 4 or Zero). WS2812B addressable LED strip. 5V power supply (ensure sufficient amperage for the LEDs). Logic level shifter (optional for 3.3V to 5V data conversion). Jumper wires and a breadboard.

Wiring: Connect the LED strip's 5V pin to the external power supply's positive terminal. Connect the GND pin of the strip to both the Raspberry Pi's GND and the power supply's negative terminal. Connect the Data In pin of the strip to GPIO18 (or another GPIO pin) on the Raspberry Pi.

Software Setup

Install Required Libraries: Open a terminal on your Raspberry Pi and run:

sudo pip3 install rpi_ws281x adafruit-circuitpython-neopixel
sudo python3 -m pip install --force-reinstall adafruit-blinka
Test Script: Use Python to control the LEDs. Save the following script as led_test.py:

import time
from rpi_ws281x import PixelStrip, Color

# LED configuration
LED_COUNT = 30 # Number of LEDs
LED_PIN = 18 # GPIO pin connected to Data In
LED_FREQ_HZ = 800000 # Frequency in Hz
LED_DMA = 10 # DMA channel
LED_BRIGHTNESS = 255 # Brightness (0-255)
LED_INVERT = False # Signal inversion
LED_CHANNEL = 0 # Channel

# Initialize strip
strip = PixelStrip(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
strip.begin()

def color_wipe(strip, color, wait_ms=50):
"""Wipe color across display."""
for i in range(strip.numPixels()):
strip.setPixelColor(i, color)
strip.show()
time.sleep(wait_ms / 1000.0)

# Main program
if __name__ == '__main__':
try:
while True:
color_wipe(strip, Color(255, 0, 0)) # Red
color_wipe(strip, Color(0, 255, 0)) # Green
color_wipe(strip, Color(0, 0, 255)) # Blue
except KeyboardInterrupt:
color_wipe(strip, Color(0, 0, 0), 10) # Turn off LEDs
Run the Script: Execute the script with:

sudo python3 led_test.py
Best Practices

Use an external power supply for strips with more than ~30 LEDs.

Ensure a common ground between the Raspberry Pi and the power supply.

For advanced effects or multiple strips, consider libraries like neopixel or tools like Node-RED
1
2
3
.

This setup allows you to create stunning lighting effects with your Raspberry Pi and addressable LEDs!

Learn more:
