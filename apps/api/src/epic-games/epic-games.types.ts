export type EpicGamesOffer = {
  providerGameId: string;
  providerNamespace?: string;
  title: string;
  slug: string;
  developer?: string;
  publisher?: string;
  startDate: Date;
  endDate: Date;
};

export type EpicGamesSyncResult = {
  storeId: string;
  offersSeen: number;
  offersSynced: number;
  checkoutUrl?: string;
  syncedAt: string;
};
