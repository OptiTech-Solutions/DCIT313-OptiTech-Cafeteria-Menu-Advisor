from __future__ import annotations

import hashlib
from typing import Any, Dict

from flask import Flask, jsonify, request
from flask_cors import CORS

from knowledge_engine import CafeteriaKnowledgeEngine

app = Flask(__name__)
CORS(app)

engine = CafeteriaKnowledgeEngine()

VALID = {
    "category": {"veg", "non_veg", "gym", "none"},
    "goal": {"high_protein", "low_carb", "low_fat", "balanced"},
    "health": {"wl", "wg", "none"},
    "meal_type": {"breakfast", "lunch", "dinner", "snack"},
    "convenience": {"quick", "none"},
    "allergy": {"none", "nuts", "dairy", "gluten", "seafood"},
}

USERS: Dict[str, Dict[str, Any]] = {}
LAST_PREFS: Dict[str, Any] | None = None
DEFAULT_PREFS = {
    "category": "none",
    "goal": "balanced",
    "health": "none",
    "meal_type": "lunch",
    "convenience": "none",
    "allergy": "none",
}


def _make_token(email: str) -> str:
    digest = hashlib.sha256(email.encode("utf-8")).hexdigest()
    return f"token-{digest[:16]}"


def _normalize_user_payload(data: Dict[str, Any]) -> Dict[str, Any]:
    name = (data.get("name") or data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    return {"name": name, "email": email, "password": password}


def _validate_prefs(data: Dict[str, Any]) -> Dict[str, Any]:
    prefs = {**DEFAULT_PREFS, **data}
    for field, allowed in VALID.items():
        value = prefs.get(field)
        if value not in allowed:
            raise ValueError(f"Invalid {field}")
    return prefs


@app.get("/api/health")
def health_check():
    return jsonify({"status": "ok"}), 200


@app.route("/api/recommend", methods=["POST"])
@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json(force=True, silent=True) or {}
    try:
        prefs = _validate_prefs(data)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 422

    global LAST_PREFS
    LAST_PREFS = prefs
    result = engine.recommend(prefs)
    if not result["meals"]:
        return jsonify({"error": "No meals found"}), 422
    return jsonify(result), 200


@app.route("/weekly-plan", methods=["GET", "POST"])
@app.route("/api/weekly-plan", methods=["GET", "POST"])
def weekly_plan():
    global LAST_PREFS
    if request.method == "POST":
        data = request.get_json(force=True, silent=True) or {}
        try:
            prefs = _validate_prefs(data)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 422
        LAST_PREFS = prefs
    else:
        prefs = LAST_PREFS or DEFAULT_PREFS

    result = engine.weekly_plan(prefs)
    return jsonify(result), 200


@app.route("/explanation", methods=["GET", "POST"])
@app.route("/api/explanation", methods=["GET", "POST"])
def explanation():
    global LAST_PREFS
    if request.method == "POST":
        data = request.get_json(force=True, silent=True) or {}
        try:
            prefs = _validate_prefs(data)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 422
        LAST_PREFS = prefs
    else:
        prefs = LAST_PREFS or DEFAULT_PREFS

    meal_type = request.args.get("meal_type")
    if meal_type and meal_type in VALID["meal_type"]:
        prefs = {**prefs, "meal_type": meal_type}

    result = engine.explanations(prefs)
    return jsonify(result), 200


@app.route("/login", methods=["POST"])
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(force=True, silent=True) or {}
    payload = _normalize_user_payload(data)

    if not payload["email"] or not payload["password"]:
        return jsonify({"error": "Email and password are required"}), 400

    existing = USERS.get(payload["email"])
    if not existing or existing["password"] != payload["password"]:
        return jsonify({"error": "Invalid email or password"}), 401

    token = _make_token(payload["email"])
    return jsonify({"token": token, "user": {"name": existing["name"], "email": payload["email"]}}), 200


@app.route("/register", methods=["POST"])
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(force=True, silent=True) or {}
    payload = _normalize_user_payload(data)

    if not payload["name"] or not payload["email"] or not payload["password"]:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if payload["email"] in USERS:
        return jsonify({"error": "User already exists"}), 409

    USERS[payload["email"]] = payload
    token = _make_token(payload["email"])
    return jsonify({"token": token, "user": {"name": payload["name"], "email": payload["email"]}}), 201


@app.route("/profile", methods=["PUT", "POST"])
@app.route("/api/profile", methods=["PUT", "POST"])
def profile():
    data = request.get_json(force=True, silent=True) or {}
    current_email = (data.get("current_email") or data.get("email") or "").strip().lower()
    new_email = (data.get("email") or "").strip().lower()
    name = (data.get("name") or "").strip()
    password = data.get("password") or ""

    if not current_email:
        return jsonify({"error": "Email is required"}), 400

    existing = USERS.get(current_email)
    if not existing:
        return jsonify({"error": "User not found"}), 404

    if new_email and new_email != current_email and new_email in USERS:
        return jsonify({"error": "Email already in use"}), 409

    updated = {
        "name": name or existing["name"],
        "email": new_email or existing["email"],
        "password": password or existing["password"],
    }

    if new_email and new_email != current_email:
        USERS.pop(current_email, None)

    USERS[updated["email"]] = updated
    token = _make_token(updated["email"])
    return jsonify({"token": token, "user": {"name": updated["name"], "email": updated["email"]}}), 200


@app.get("/")
def index():
    return jsonify({"message": "Cafeteria Menu Advisor API"}), 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
