const AUTH_ERROR_TRANSLATIONS = new Map([
  ['invalid email or password', 'The email or password is incorrect.'],
  ['your account is pending approval by the diocese administrator', 'Your account is still awaiting approval.'],
  ['this account invitation is pending setup', 'Your invite has not been completed yet. Please finish setup before signing in.'],
  ['an account with this email already exists', 'That email is already registered. Try signing in or use another email.'],
  ['invalid or already used invite code', 'That invite code is invalid or has already been used.'],
  ['invite code has expired', 'This invite code has expired. Request a new invitation or contact support.'],
  ['account not found', 'No account was found with that email address.'],
  ['invalid or expired refresh token', 'Your session has expired. Please sign in again.'],
  ['account suspended. contact diocese administrator', 'Your account has been suspended. Contact your administrator for help.'],
  ['too many failed attempts. try again later', 'Too many failed attempts. Please try again in a few minutes.'],
  ['password cannot be longer than 72 bytes, truncate manually if necessary (e.g. my_password[:72])',
    'Your password is too long. Please use 72 characters or fewer.'],
]);

export function translateAuthError(rawMessage) {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return 'Something went wrong. Please try again.';
  }

  const normalized = rawMessage.trim().toLowerCase();
  if (AUTH_ERROR_TRANSLATIONS.has(normalized)) {
    return AUTH_ERROR_TRANSLATIONS.get(normalized);
  }

  return rawMessage;
}
