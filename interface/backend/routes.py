import flask
from flask import jsonify, request

from prolog_bridge import query_recommendations

VALID = {
    "category": {"veg", "non_veg", "gym", "none"},
    "goal": {"high_protein", "low_carb", "low_fat", "balanced"},
    "health": {"wl", "wg", "none"},
    "meal_type": {"breakfast", "lunch", "dinner", "snack"},
    "convenience": {"quick", "none"},
}


def register_routes(app):
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok"}), 200

    @app.route("/api/recommend", methods=["POST"])
    def recommend():
        data = request.get_json(force=True, silent=True) or {}

        for field, allowed in VALID.items():
            value = data.get(field)
            if value not in allowed:
                return jsonify({"error": f"Invalid {field}"}), 422

        result = query_recommendations(data)
        if not result["meals"]:
            return jsonify({"error": "No meals found"}), 422

        return jsonify(result), 200
