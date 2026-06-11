const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

// ---------------------------------------------------------------------------
// Secret accessors — throw immediately if a secret is missing rather than
// silently falling back to the access token secret (which would make the two
// token types cryptographically interchangeable).
// ---------------------------------------------------------------------------

function getAccessSecret() {
  if (!config.jwt.secret) {
    throw new Error('FATAL: JWT_SECRET is not configured.');
  }
  return config.jwt.secret;
}

function getRefreshSecret() {
  if (!config.jwt.refreshSecret) {
    throw new Error(
      'FATAL: JWT_REFRESH_SECRET is not configured. ' +
      'Refusing to fall back to the access token secret.'
    );
  }
  return config.jwt.refreshSecret;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ---------------------------------------------------------------------------
// Token generation
// A "typ" claim is embedded so that even if secrets were ever accidentally
// unified, cross-type verification would still be rejected explicitly.
// ---------------------------------------------------------------------------

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, typ: 'access' },
    getAccessSecret(),
    { expiresIn: config.jwt.accessExpiry || '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      jti: crypto.randomUUID(),
      typ: 'refresh'
    },
    getRefreshSecret(),
    { expiresIn: config.jwt.refreshExpiry || '7d' }
  );
}

// ---------------------------------------------------------------------------
// Token verification
// Both the signature AND the "typ" claim are checked so a refresh token
// cannot be submitted to an access-token-guarded route (and vice versa).
// ---------------------------------------------------------------------------

function verifyAccessToken(token) {
  const payload = jwt.verify(token, getAccessSecret());
  if (payload.typ !== 'access') {
    throw Object.assign(new Error('Token type mismatch: expected access token.'), {
      statusCode: 401
    });
  }
  return payload;
}

function verifyRefreshToken(token) {
  const payload = jwt.verify(token, getRefreshSecret());
  if (payload.typ !== 'refresh') {
    throw Object.assign(new Error('Token type mismatch: expected refresh token.'), {
      statusCode: 401
    });
  }
  return payload;
}

module.exports = {
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};