import { createCipheriv, createDecipheriv, randomBytes, createHmac } from 'crypto';

// AES-256-GCM constants
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;      // 96-bit IV — recommended for GCM
const TAG_LENGTH = 16;     // 128-bit auth tag
const KEY_LENGTH = 32;     // 256-bit key

// Envelope format (all base64, colon-delimited): version:keyVersion:iv:tag:ciphertext
const ENVELOPE_VERSION = '1';

function getEncryptionKey(): Buffer {
  const raw = process.env['PII_ENCRYPTION_KEY'];
  if (!raw) throw new Error('PII_ENCRYPTION_KEY env var is not set');
  const key = Buffer.from(raw, 'base64');
  if (key.length !== KEY_LENGTH) {
    throw new Error(`PII_ENCRYPTION_KEY must be 32 bytes (got ${key.length}). Generate with: openssl rand -base64 32`);
  }
  return key;
}

function getHmacKey(): Buffer {
  const raw = process.env['AUDIT_HMAC_KEY'];
  if (!raw) throw new Error('AUDIT_HMAC_KEY env var is not set');
  return Buffer.from(raw, 'base64');
}

export function getKeyVersion(): string {
  return process.env['PII_KEY_VERSION'] ?? '1';
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a self-describing envelope so key rotation is possible
 * without re-encrypting all rows at once.
 */
export function encryptPII(plaintext: string): string {
  const key = getEncryptionKey();
  const keyVersion = getKeyVersion();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // envelope: v1:<keyVersion>:<iv_b64>:<tag_b64>:<ciphertext_b64>
  return [
    ENVELOPE_VERSION,
    keyVersion,
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

/**
 * Decrypts an AES-256-GCM envelope produced by encryptPII.
 * Throws on tampered ciphertext (GCM auth tag mismatch).
 */
export function decryptPII(envelope: string): string {
  const parts = envelope.split(':');
  if (parts.length !== 5) throw new Error('Invalid PII envelope format');

  const [version, , ivB64, tagB64, ciphertextB64] = parts;
  if (version !== ENVELOPE_VERSION) throw new Error(`Unsupported envelope version: ${version}`);

  const key = getEncryptionKey();
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

/**
 * Returns true if the value looks like an encrypted PII envelope.
 * Allows safe re-encryption checks and migration idempotency.
 */
export function isEncrypted(value: string): boolean {
  return value.startsWith(`${ENVELOPE_VERSION}:`) && value.split(':').length === 5;
}

/**
 * HMAC-SHA256 signing for audit log entries.
 * Uses a separate AUDIT_HMAC_KEY so audit signing is independent
 * of PII encryption key rotation.
 */
export function signAuditRecord(payload: string): string {
  const key = getHmacKey();
  return createHmac('sha256', key).update(payload).digest('hex');
}

export function verifyAuditSignature(payload: string, signature: string): boolean {
  const expected = signAuditRecord(payload);
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Generates a new random 256-bit key encoded as base64.
 * Used in dev setup scripts to generate PII_ENCRYPTION_KEY and AUDIT_HMAC_KEY.
 */
export function generateKey(): string {
  return randomBytes(KEY_LENGTH).toString('base64');
}
