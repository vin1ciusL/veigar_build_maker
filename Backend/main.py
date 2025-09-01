import os
from flask import Flask, jsonify, send_from_directory
import requests
from flask_cors import CORS

app = Flask(__name__, static_folder="../Frontend")
CORS(app)

FRONTEND_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Frontend")

@app.route("/")
def index():
    return send_from_directory(FRONTEND_FOLDER, "index.html")

@app.route("/style.css")
def style():
    return send_from_directory(FRONTEND_FOLDER, "style.css")

@app.route("/script.js")
def scripts():
    return send_from_directory(FRONTEND_FOLDER, "script.js")

@app.route("/items")
def get_items():
    versions_url = "https://ddragon.leagueoflegends.com/api/versions.json"
    versions = requests.get(versions_url).json()
    latest_version = versions[0]

    items_url = f"https://ddragon.leagueoflegends.com/cdn/{latest_version}/data/en_US/item.json"
    items_data = requests.get(items_url).json()["data"]

    filtered_items = {}
    seen_names = set()
    for item_id, item_data in items_data.items():
        tags = item_data.get("tags", [])
        stats = item_data.get("stats", {})
        maps = item_data.get("maps", {})
        gold = item_data.get("gold", {}).get("total", 0)
        if (maps.get("11") 
            and item_data.get("inStore", True) 
            and gold > 0 
            and not item_data.get("consumed", False)
            and not any(t in tags for t in ["Consumable", "Trinket", "Vision", "Ward"])
            and ("Damage" not in tags and stats.get("FlatPhysicalDamageMod", 0) == 0)
            and "from" in item_data and item_data["from"]
            and item_data["name"] not in seen_names
            and item_data["name"] != "Shattered Armguard"
        ):

            seen_names.add(item_data["name"])
            filtered_items[item_id] = {
                "name": item_data["name"],
                "image": item_data["image"]["full"],
                "version": latest_version,
                "tags": tags,
                "stats": stats
            }
    return jsonify(filtered_items)

if __name__ == "__main__":
    app.run(debug=True)
