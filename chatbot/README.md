# Chatbot

Owner: Naura. Task sheet: [`docs/tasks/naura.md`](../docs/tasks/naura.md).

The chatbot is the friendly front door of GasRek!. It reads a question in everyday Indonesian, extracts the origin, destination, time, passenger type and preference, calls `POST /routes/search`, and explains the result.

## Principles

- **Never invent routes, times or fares.** Every number in a reply comes from the search result.
- Ask back when a stop name is ambiguous, offering choices from `GET /stops`.
- Reply in short, plain Indonesian, step by step.
- Keep working without the LLM through a simple pattern-based fallback, so the demo does not depend on an external API.

## Planned files

| File | Content |
| --- | --- |
| `extractor.py` | Turns a sentence into search parameters (LLM tool calling) |
| `fallback.py` | Pattern-based extractor used without the LLM |
| `responder.py` | Turns a search result into a reply |
| `prompts/` | System prompt and examples |
| `examples.md` | Test sentences and expected parameters |
