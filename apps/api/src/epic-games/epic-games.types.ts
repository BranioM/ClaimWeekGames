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
  source: 'manual' | 'scheduled';
  offersSeen: number;
  offersSynced: number;
  gamesCreated: number;
  gamesUpdated: number;
  externalIdsCreated: number;
  externalIdsUpdated: number;
  offersCreated: number;
  offersUpdated: number;
  checkoutUrl?: string;
  syncedAt: string;
  durationMs: number;
};

export type EpicGamesSyncSource = EpicGamesSyncResult['source'];
