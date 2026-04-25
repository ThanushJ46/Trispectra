from flask import Flask, jsonify
from firebase_config import db

app = Flask(__name__)

# Home Route
@app.route("/")
def home():
    return "WasteWise Backend Running Successfully 🚀"


# Users Route
@app.route("/users")
def get_users():
    docs = db.collection("users").stream()
    data = []

    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id
        data.append(item)

    return jsonify(data)


# Leaderboard Route
@app.route("/leaderboard")
def get_leaderboard():
    docs = db.collection("leaderboard").stream()
    data = []

    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id
        data.append(item)

    return jsonify(data)


# Reminders Route
@app.route("/reminders")
def get_reminders():
    docs = db.collection("reminders").stream()
    data = []

    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id
        data.append(item)

    return jsonify(data)


# Analyses Route
@app.route("/analyses")
def get_analyses():
    docs = db.collection("analyses").stream()
    data = []

    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id
        data.append(item)

    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)