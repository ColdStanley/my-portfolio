import sha256 from 'js-sha256';

/**
 * Hash a password using SHA-256
 * @param password - The plain text password to hash
 * @returns The hashed password as a string
 */
export function hashPassword(password: string): string {
  return sha256(password);
}

/**
 * Verify a password against its hash
 * @param password - The plain text password to verify
 * @param hash - The stored hash to compare against
 * @returns True if the password matches the hash, false otherwise
 */
export function verifyPassword(password: string, hash: string): boolean {
  return sha256(password) === hash;
}