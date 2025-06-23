from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import json
import os

app = FastAPI()

# --- Data Structure ---
# Pydantic model to validate the incoming JSON data from ESP32
class ShelfData(BaseModel):
    shelf_id: str
    items: list[dict]

# --- In-memory database ---
# A simple dictionary to store the latest data for each shelf
shelf_database = {}

# --- Mount static files and templates ---
# Get the absolute path of the directory containing this main.py file
current_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the correct paths to the 'static' and 'templates' directories
static_path = os.path.join(current_dir, "static")
templates_path = os.path.join(current_dir, "templates")

# Mount the 'static' directory to serve files like CSS and JavaScript
app.mount("/static", StaticFiles(directory=static_path), name="static")
# Initialize the template engine
templates = Jinja2Templates(directory=templates_path)


# --- API Endpoint to receive data from ESP32 ---
@app.post("/api/update_shelf")
async def update_shelf(data: ShelfData):
    """
    This is the endpoint that the ESP32 will send its data to.
    It receives shelf data, validates it using the ShelfData model,
    and updates the in-memory database.
    """
    shelf_id = data.shelf_id
    print(f"Received data for shelf: {shelf_id}")
    print(f"Items: {data.items}")

    # Store or update the data in our simple dictionary database
    shelf_database[shelf_id] = data.items

    # Send a success response back to the ESP32
    return {"status": "success", "shelf_id": shelf_id, "received_items": len(data.items)}


# --- Web page endpoint ---
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """
    This endpoint serves the main HTML web page.
    It renders the index.html template.
    """
    # The template will have access to the 'request' object.
    # We pass the entire database to the template so it can display initial data if available.
    return templates.TemplateResponse("index.html", {"request": request, "shelf_data": shelf_database})


# --- API Endpoint for the web page to fetch updated data ---
@app.get("/api/get_shelf_data")
async def get_shelf_data():
    """
    This endpoint is called by the JavaScript on the web page
    to get the latest shelf data asynchronously.
    """
    return shelf_database

# To run this server:
# 1. Make sure you are in the directory containing this file (e.g., .../src/)
# 2. Run the command in your terminal:
#    uvicorn main:app --host 0.0.0.0 --port 8000
