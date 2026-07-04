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
  syncJobId: string;
  storeId: string;
  offersSeen: number;
  offersSynced: number;
  gamesCreated: number;
  externalIdsCreated: number;
  offersCreated: number;
  offersUpdated: number;
  checkoutUrl?: string;
  syncedAt: string;
};
