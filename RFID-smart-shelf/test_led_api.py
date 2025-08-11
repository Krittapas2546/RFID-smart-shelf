#!/usr/bin/env python3
"""
Test script for LED Control APIs
ทดสอบ API การควบคุม LED ด้วยรูปแบบต่างๆ
"""

import requests
import json
import time

# Server URL
BASE_URL = "http://localhost:8000"

def test_led_by_position():
    """ทดสอบควบคุม LED ด้วย position string เช่น L1B1"""
    print("🔵 Testing LED control by position...")
    
    # ติดไฟสีแดงที่ L1B1
    response = requests.post(f"{BASE_URL}/api/led/position", 
        json={
            "position": "L1B1",
            "r": 255,
            "g": 0,
            "b": 0
        }
    )
    print(f"L1B1 Red: {response.status_code} - {response.json()}")
    time.sleep(1)
    
    # ติดไฟสีเขียวที่ L2B3
    response = requests.post(f"{BASE_URL}/api/led/position",
        json={
            "position": "L2B3", 
            "r": 0,
            "g": 255,
            "b": 0
        }
    )
    print(f"L2B3 Green: {response.status_code} - {response.json()}")
    time.sleep(1)
    
    # ติดไฟสีน้ำเงินที่ L1B3
    response = requests.post(f"{BASE_URL}/api/led/position",
        json={
            "position": "L1B3",
            "r": 0,
            "g": 0, 
            "b": 255
        }
    )
    print(f"L1B3 Blue: {response.status_code} - {response.json()}")
    time.sleep(2)

def test_led_batch_positions():
    """ทดสอบควบคุม LED หลายตำแหน่งพร้อมกัน"""
    print("\n🌈 Testing batch LED control by positions...")
    
    response = requests.post(f"{BASE_URL}/api/led/positions",
        json={
            "positions": [
                {"position": "L1B1", "r": 255, "g": 0, "b": 0},    # แดง
                {"position": "L1B2", "r": 0, "g": 255, "b": 0},    # เขียว
                {"position": "L1B3", "r": 0, "g": 0, "b": 255},    # น้ำเงิน
                {"position": "L2B1", "r": 255, "g": 255, "b": 0},  # เหลือง
                {"position": "L2B2", "r": 255, "g": 0, "b": 255},  # ม่วง
            ]
        }
    )
    print(f"Batch positions: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Successfully controlled {result['count']} LEDs")
        print(f"Positions: {result['positions']}")
    else:
        print(f"❌ Error: {response.json()}")
    time.sleep(3)

def test_invalid_positions():
    """ทดสอบการจัดการ position ผิดๆ"""
    print("\n❌ Testing invalid positions...")
    
    # ทดสอบ format ผิด
    response = requests.post(f"{BASE_URL}/api/led/position",
        json={
            "position": "INVALID",
            "r": 255,
            "g": 0,
            "b": 0
        }
    )
    print(f"Invalid format: {response.status_code} - {response.json()['error']}")
    
    # ทดสอบตำแหน่งที่ไม่มีอยู่
    response = requests.post(f"{BASE_URL}/api/led/position",
        json={
            "position": "L10B10",  # ตำแหน่งที่ไม่มีอยู่
            "r": 255,
            "g": 0,
            "b": 0
        }
    )
    print(f"Invalid position: {response.status_code} - {response.json()['error']}")

def test_clear_leds():
    """ทดสอบการดับไฟทั้งหมด"""
    print("\n🔘 Testing clear all LEDs...")
    
    response = requests.post(f"{BASE_URL}/api/led/clear")
    print(f"Clear LEDs: {response.status_code} - {response.json()}")

def test_shelf_config():
    """ตรวจสอบ configuration ของชั้นวาง"""
    print("\n📊 Getting shelf configuration...")
    
    response = requests.get(f"{BASE_URL}/api/shelf/config")
    if response.status_code == 200:
        config = response.json()
        print(f"Shelf config: {config}")
        print(f"Total levels: {config['total_levels']}")
        print(f"Max blocks: {config['max_blocks']}")
        print("Available positions:")
        for level, blocks in config['config'].items():
            positions = [f"L{level}B{block}" for block in range(1, blocks + 1)]
            print(f"  Level {level}: {positions}")
    else:
        print(f"❌ Error getting config: {response.json()}")

def run_led_demo():
    """รันเดโม่การใช้งาน LED APIs ทั้งหมด"""
    print("🚀 Starting LED API Demo...")
    print("=" * 50)
    
    try:
        # 1. ตรวจสอบ config ก่อน
        test_shelf_config()
        
        # 2. ทดสอบควบคุมทีละดวง
        test_led_by_position()
        
        # 3. ทดสอบควบคุมหลายดวง
        test_led_batch_positions()
        
        # 4. ทดสอบ error handling
        test_invalid_positions()
        
        # 5. ดับไฟทั้งหมด
        test_clear_leds()
        
        print("\n✅ Demo completed successfully!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Make sure the server is running at http://localhost:8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    run_led_demo()
