# Backend

Owner: Naura. Task sheet: [`docs/tasks/naura.md`](../docs/tasks/naura.md).

FastAPI service that runs a search through the graph and the rules, and serves the frontend and the chatbot. Endpoints and data shapes: [`docs/api-contract.md`](../docs/api-contract.md).

## Planned structure

| File | Content |
| --- | --- |
| `app/main.py` | API entry point and endpoints |
| `app/graph_client.py` | Neo4j connection and queries |
| `app/rules_client.py` | Calls the rules module |
| `app/search.py` | One search: graph → rules → alternative stop |
| `app/config.py` | Reads settings from `.env` |
| `requirements.txt` | Python dependencies |
