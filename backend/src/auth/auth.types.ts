/** Claims stored in the session JWT. */
export interface SessionPayload {
  sub: string;
  email: string;
}

/** The signed-in admin, attached to the request by `JwtAuthGuard`. */
export interface AuthenticatedAdmin {
  id: string;
  email: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    admin?: AuthenticatedAdmin;
  }
}
