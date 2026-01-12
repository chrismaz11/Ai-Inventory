# Sentinel Journal

This journal records CRITICAL security learnings, vulnerabilities, and patterns discovered during the development and maintenance of this application.

## Format

Each entry should follow this format:

## YYYY-MM-DD - [Title]
**Vulnerability:** [What you found]
**Learning:** [Why it existed]
**Prevention:** [How to avoid next time]

## 2024-05-23 - Missing Rate Limiting on API
**Vulnerability:** The API endpoints were exposed without any rate limiting, making the application susceptible to Denial of Service (DoS) attacks and brute-force attempts.
**Learning:** Even internal or small-scale applications require basic rate limiting to prevent abuse. The assumption that `express-rate-limit` was present was incorrect; manual verification of security controls is essential.
**Prevention:** Always verify the existence and configuration of security middleware. Implement a default "deny-all" or "limit-all" policy at the application entry point.
