from __future__ import annotations

import json
import hashlib
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

# pyrefly: ignore[missing-import]
from knowledge_engine import CafeteriaKnowledgeEngine

engine = CafeteriaKnowledgeEngine()

VALID = {
    "category": {"veg", "non_veg", "gym", "none"},
    "goal": {"high_protein", "low_carb", "low_fat", "balanced"},
    "health": {"wl", "wg", "none"},
    "meal_type": {"breakfast", "lunch", "dinner", "snack"},
    "convenience": {"quick", "none"},
    "allergy": {"none", "nuts", "dairy", "gluten", "seafood"},
}

USERS = {}
LAST_PREFS = None
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


def _normalize_user_payload(data: dict) -> dict:
    name = (data.get("name") or data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    return {"name": name, "email": email, "password": password}


def _validate_prefs(data: dict) -> dict:
    prefs = {**DEFAULT_PREFS, **data}
    for field, allowed in VALID.items():
        if prefs.get(field) not in allowed:
            raise ValueError(f"Invalid {field}")
    return prefs


def _json_response(payload: dict, status: int = 200) -> bytes:
    return json.dumps(payload).encode("utf-8")


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/api/health":
            self._send_json({"status": "ok"}, 200)
            return
        if path in {"/weekly-plan", "/api/weekly-plan"}:
            prefs = LAST_PREFS or DEFAULT_PREFS
            self._send_json(engine.weekly_plan(prefs), 200)
            return
        if path in {"/explanation", "/api/explanation"}:
            prefs = LAST_PREFS or DEFAULT_PREFS
            self._send_json(engine.explanations(prefs), 200)
            return
        self._send_json({"message": "Cafeteria Menu Advisor API"}, 200)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(length) if length else b"{}"
        try:
            data = json.loads(raw_body.decode("utf-8")) if raw_body else {}
        except json.JSONDecodeError:
            data = {}

        if path in {"/api/recommend", "/recommend"}:
            try:
                prefs = _validate_prefs(data)
            except ValueError as exc:
                self._send_json({"error": str(exc)}, 422)
                return
            global LAST_PREFS
            LAST_PREFS = prefs
            result = engine.recommend(prefs)
            if not result["meals"]:
                self._send_json({"error": "No meals found"}, 422)
                return
            self._send_json(result, 200)
            return

        if path in {"/login", "/api/login"}:
            payload = _normalize_user_payload(data)
            if not payload["email"] or not payload["password"]:
                self._send_json({"error": "Email and password are required"}, 400)
                return
            existing = USERS.get(payload["email"])
            if not existing or existing["password"] != payload["password"]:
                self._send_json({"error": "Invalid email or password"}, 401)
                return
            token = _make_token(payload["email"])
            self._send_json({"token": token, "user": {"name": existing["name"], "email": payload["email"]}}, 200)
            return

        if path in {"/register", "/api/register"}:
            payload = _normalize_user_payload(data)
            if not payload["name"] or not payload["email"] or not payload["password"]:
                self._send_json({"error": "Name, email, and password are required"}, 400)
                return
            if payload["email"] in USERS:
                self._send_json({"error": "User already exists"}, 409)
                return
            USERS[payload["email"]] = payload
            token = _make_token(payload["email"])
            self._send_json({"token": token, "user": {"name": payload["name"], "email": payload["email"]}}, 201)
            return

        self._send_json({"message": "Cafeteria Menu Advisor API"}, 200)

    def _send_json(self, payload: dict, status: int) -> None:
        body = _json_response(payload, status)
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args) -> None:  # noqa: A003
        return


def run_server(host: str = "0.0.0.0", port: int = 5000) -> None:
    server = HTTPServer((host, port), Handler)
    print(f"Listening on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run_server()
