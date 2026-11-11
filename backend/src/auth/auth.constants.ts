/** How long a sign-in lasts. The JWT expiry and the cookie lifetime both derive from this. */
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export const BCRYPT_ROUNDS = 12;

/** bcrypt only uses the first 72 bytes of a password, so longer ones are refused, not truncated. */
export const PASSWORD_MAX_BYTES = 72;

/**
 * A valid bcrypt hash of a random throwaway value. Sign-in compares against it when the email is
 * unknown, so a wrong email takes exactly as long as a wrong password and can't be told apart.
 */
export const DUMMY_PASSWORD_HASH = '$2b$12$7m/N4CuHcozWaZwtHSNbq.tITQ.P1HIT3zlIfip0aCHGxjdvvIkFq';
