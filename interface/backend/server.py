from __future__ import annotations

import json
import logging
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse
from typing import Any, Dict

from prolog_bridge import PrologBridge

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("cafeteria_server")

bridge = PrologBridge()
LAST_PREFS: Dict[str, Any] = {}


def _json_bytes(data: Any) -> bytes:
    return json.dumps(data, indent=2).encode("utf-8")


class CafeteriaApiHandler(BaseHTTPRequestHandler):
    """Zero-dependency, high-speed API server connecting to Prolog Expert System."""

    def _set_cors_headers(self, status: int = 200, content_type: str = "application/json") -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

    def do_OPTIONS(self) -> None:  # noqa: N802
        """Handle CORS pre-flight requests."""
        self._set_cors_headers(200)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        if path in {"", "/api", "/api/health"}:
            body = _json_bytes({
                "status": "ok",
                "service": "Cafeteria Menu Advisor Expert System",
                "prolog_kb": "knowledge_base/cafeteria_kb.pl",
                "engine": "SWI-Prolog" if bridge.is_swipl_available() else "Prolog KB Horn-Clause Engine",
            })
            self._send_payload(body, 200)
            return

        if path in {"/weekly-plan", "/api/weekly-plan"}:
            result = bridge.weekly_plan(LAST_PREFS)
            self._send_payload(_json_bytes(result), 200)
            return

        if path in {"/explanation", "/api/explanation"}:
            query_params = parse_qs(parsed.query)
            prefs = dict(LAST_PREFS)
            if "meal_type" in query_params:
                prefs["meal_type"] = query_params["meal_type"][0]
            result = bridge.explanations(prefs)
            self._send_payload(_json_bytes(result), 200)
            return

        self._send_payload(_json_bytes({"error": f"Path not found: {path}"}), 404)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(length) if length > 0 else b"{}"

        try:
            data = json.loads(raw_body.decode("utf-8")) if raw_body else {}
        except json.JSONDecodeError:
            data = {}

        global LAST_PREFS

        if path in {"/recommend", "/api/recommend"}:
            LAST_PREFS = data
            result = bridge.recommend(data)
            self._send_payload(_json_bytes(result), 200)
            return

        if path in {"/weekly-plan", "/api/weekly-plan"}:
            if data:
                LAST_PREFS = data
            result = bridge.weekly_plan(LAST_PREFS)
            self._send_payload(_json_bytes(result), 200)
            return

        if path in {"/explanation", "/api/explanation"}:
            if data:
                LAST_PREFS = data
            result = bridge.explanations(LAST_PREFS)
            self._send_payload(_json_bytes(result), 200)
            return

        # Backwards-compatibility for auth endpoints so frontend never errors
        if path in {"/login", "/api/login", "/register", "/api/register"}:
            name = data.get("name") or data.get("full_name") or "Student"
            email = data.get("email") or "student@ug.edu.gh"
            self._send_payload(_json_bytes({
                "token": "expert-system-session",
                "user": {"name": name, "email": email},
            }), 200)
            return

        self._send_payload(_json_bytes({"error": f"Path not found: {path}"}), 404)

    def do_PUT(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        if path in {"/profile", "/api/profile"}:
            self._send_payload(_json_bytes({"status": "updated"}), 200)
            return
        self._send_payload(_json_bytes({"error": "Not found"}), 404)

    def _send_payload(self, body: bytes, status: int = 200) -> None:
        self._set_cors_headers(status)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format_str: str, *args) -> None:  # noqa: A003
        logger.info("%s - - [%s] %s", self.client_address[0], self.log_date_time_string(), format_str % args)


def run_server(host: str = "0.0.0.0", port: int = 5000) -> None:
    server = HTTPServer((host, port), CafeteriaApiHandler)
    logger.info("======================================================")
    logger.info(" Cafeteria Menu Advisor Expert System Backend Running ")
    logger.info(" Listening on http://localhost:%d                       ", port)
    logger.info(" Connected to Prolog KB: %s                           ", bridge.kb_path)
    logger.info("======================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down server...")
        server.server_close()


if __name__ == "__main__":
    run_server()
