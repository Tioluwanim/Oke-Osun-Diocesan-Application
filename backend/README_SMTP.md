SMTP configuration and local testing

Overview
- The app sends password reset OTPs via SMTP. If SMTP credentials are not set, the server will log OTPs in non-production environments so you can test the flow locally.

Environment variables (set these in Render / your host):
- `SMTP_HOST` (e.g., smtp.sendgrid.net)
- `SMTP_PORT` (587 for TLS)
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL` (optional)
- `SMTP_FROM_NAME` (optional)
- `FORCE_LOG_OTP` (optional) — set to `true` to force OTP values to be logged even in production (useful for transient debugging; avoid in long-term production use).

For Render:
1. Open your service dashboard.
2. Go to Environment > Environment Variables and add the variables above.
3. Redeploy or restart the service.

Local testing with MailHog (recommended):
1. From the `backend/` folder, start MailHog with Docker Compose:

```bash
cd backend
docker compose -f docker-compose.mailhog.yml up -d
```

2. Set these env vars (for example in `.env` or your shell):

```bash
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASSWORD=""
```

Note: `SMTP_USER`/`SMTP_PASSWORD` are not required for MailHog.

3. Trigger the forgot-password endpoint (replace host as needed):

```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"you@example.com"}' http://localhost:8000/auth/forgot-password
```

4. Open the MailHog web UI at http://localhost:10000 to view the OTP email.

Security note
- The server no longer logs OTP values when `ENVIRONMENT` is set to `production`. Ensure SMTP is configured in production to enable real email delivery.

Automated local test
- A small integration script is included at `backend/scripts/test_forgot_flow.py` which runs the entire flow against a local backend and MailHog instance. Example:

```bash
cd backend
MAILHOG_API=http://localhost:10000/api/v2/messages BASE_URL=http://localhost:8000 python scripts/test_forgot_flow.py
```

The script will attempt to register a test user (if not present), trigger the forgot-password flow, read the OTP from MailHog, verify the OTP, reset the password, and finally attempt login with the new password.

CI
- A GitHub Actions workflow `.github/workflows/forgot-password-ci.yml` is included to run this integration flow on PRs and pushes to `main`. It starts `mongo` and `mailhog` services, runs the backend, and executes the script. Use this to catch regressions to the forgot-password flow.

Health check
- A lightweight SMTP health endpoint is available at `GET /auth/smtp-health`. It will return JSON showing whether SMTP appears configured and whether a connection/test login succeeded. Use this after setting env vars to verify connectivity.
