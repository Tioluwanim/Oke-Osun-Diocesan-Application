#!/usr/bin/env python3
"""Integration test for forgot-password → verify-reset-otp → reset-password using MailHog.

Usage:
  MAILHOG_API=http://localhost:10000/api/v2/messages BASE_URL=http://localhost:8000 python scripts/test_forgot_flow.py

Ensure the backend and MailHog are running locally.
"""
import os
import time
import re
import sys
import requests

BASE_URL = os.getenv('BASE_URL', 'http://localhost:8000')
MAILHOG_API = os.getenv('MAILHOG_API', 'http://localhost:10000/api/v2/messages')
TEST_EMAIL = os.getenv('TEST_EMAIL', 'test+forgot@example.com')
TEST_PASSWORD = os.getenv('TEST_PASSWORD', 'TestPass!234')
NEW_PASSWORD = os.getenv('NEW_PASSWORD', 'NewPass!234')

session = requests.Session()

def safe_post(path, payload):
    url = BASE_URL.rstrip('/') + path
    r = session.post(url, json=payload)
    try:
        data = r.json()
    except Exception:
        data = r.text
    return r.status_code, data


def register_user():
    print('Registering test user (if not exists)')
    payload = {"fullName": "Integration Tester", "email": TEST_EMAIL, "password": TEST_PASSWORD, "role": "member"}
    status, data = safe_post('/auth/register', payload)
    print('register ->', status, data)
    if status not in (200, 201):
        # If already exists, proceed
        if isinstance(data, dict) and data.get('detail') and 'already exists' in str(data.get('detail')):
            print('User already exists; continuing')
        else:
            print('Unexpected register response; continuing anyway')


def trigger_forgot():
    print('Triggering forgot-password')
    status, data = safe_post('/auth/forgot-password', {"email": TEST_EMAIL})
    print('forgot-password ->', status, data)


def fetch_otp(timeout=15):
    print('Polling MailHog for OTP...')
    deadline = time.time() + timeout
    regex = re.compile(r"(\d{6})")
    while time.time() < deadline:
        try:
            r = requests.get(MAILHOG_API, timeout=5)
            items = r.json().get('items', [])
            for item in items:
                # Check recipients
                tos = []
                try:
                    tos = [t.get('Mailbox', '') + '@' + t.get('Domain', '') for t in item.get('To', [])]
                except Exception:
                    pass
                # Fallback: check headers
                headers = item.get('Content', {}).get('Headers', {})
                to_header = headers.get('To', [''])[0] if isinstance(headers.get('To'), list) else headers.get('To', '')
                body = item.get('Content', {}).get('Body', '') or item.get('Content', {}).get('Body', '')

                if TEST_EMAIL in tos or TEST_EMAIL in to_header or TEST_EMAIL in item.get('Raw', {}).get('To', ''):
                    m = regex.search(body)
                    if m:
                        print('Found OTP in message')
                        return m.group(1)
        except Exception as exc:
            print('MailHog fetch error:', exc)
        time.sleep(1)
    return None


def verify_otp(otp):
    print('Verifying OTP')
    status, data = safe_post('/auth/verify-reset-otp', {"email": TEST_EMAIL, "otp": otp})
    print('verify-reset-otp ->', status, data)
    if status == 200 and isinstance(data, dict):
        return data.get('reset_token')
    return None


def reset_password(token):
    print('Resetting password')
    status, data = safe_post('/auth/reset-password', {"email": TEST_EMAIL, "reset_token": token, "new_password": NEW_PASSWORD})
    print('reset-password ->', status, data)
    return status == 200


def attempt_login():
    print('Attempting login with new password')
    status, data = safe_post('/auth/login', {"email": TEST_EMAIL, "password": NEW_PASSWORD})
    print('login ->', status, data)
    return status == 200


def main():
    register_user()
    trigger_forgot()
    otp = fetch_otp(timeout=30)
    if not otp:
        print('Failed to retrieve OTP from MailHog')
        sys.exit(2)
    print('OTP:', otp)
    token = verify_otp(otp)
    if not token:
        print('Failed to verify OTP')
        sys.exit(3)
    if not reset_password(token):
        print('Failed to reset password')
        sys.exit(4)
    if not attempt_login():
        print('Login with new password failed')
        sys.exit(5)
    print('Forgot-password flow successful')


if __name__ == '__main__':
    main()
