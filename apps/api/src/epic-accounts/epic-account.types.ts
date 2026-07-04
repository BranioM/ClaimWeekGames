export type EpicAccountConnectionState = {
  state: string;
  expiresAt: Date;
};

export type ConnectEpicAccountInput = {
  userId: string;
  state: string;
  externalAccountId: string;
  displayName?: string;
};

export type ConnectedEpicAccount = {
  id: string;
  userId: string;
  platformId: string;
  externalAccountId: string;
  displayName?: string;
};
