export type AuthenticatedUser = {
  id: string;
  email: string;
};

export type AuthenticatedRequest = {
  user?: AuthenticatedUser;
};

export type CreatedSession = {
  token: string;
  expiresAt: Date;
  user: AuthenticatedUser;
};
