# Sentinel Journal

## 2026-01-23 - Information Leakage in Error Responses
**Vulnerability:** The application was configured to send raw error messages (including potentially sensitive details from third-party services like OpenAI) directly to the client in JSON responses.
**Learning:** Defaulting to `err.message` in error handlers is convenient for debugging but dangerous in production as it can leak stack traces, API keys, or database schema details.
**Prevention:** Always sanitize error messages sent to the client. Log the full error internally, but return a generic "Internal Server Error" message to the user.
