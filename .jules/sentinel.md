## 2025-02-19 - [Unsafe Global Error Handling]
**Vulnerability:** The global error handler in `server/index.ts` was explicitly configured to return `err.message` to the client for 500 errors and re-throw the error, potentially crashing the server or leaking sensitive internal states.
**Learning:** Default express error templates or copy-pasted middleware often prioritize debugging over security. The `throw err` pattern at the end of the middleware chain is unusual and dangerous in production.
**Prevention:** Always sanitize 500 error messages to "Internal Server Error" and log the actual error securely on the server side. Ensure the error handler terminates the response cycle without crashing the process.
