# Backend overview

This backend now keeps the expert-system logic centered on the knowledge base and exposes a thin API for the frontend.

## Flow

1. The frontend sends user preferences to the API.
2. The backend validates the payload and passes it to the knowledge engine.
3. The knowledge engine applies the rules encoded in the project knowledge base and returns recommendations, weekly plans, and explanations.

## Run locally

```bash
python simple_server.py
```

The API will be available at http://localhost:5000.
