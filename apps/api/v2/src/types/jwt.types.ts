export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  googleId: string | null;
  image: string | null;
  contactNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}
