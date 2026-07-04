import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EpicGamesOffer } from './epic-games.types.js';
import { slugify } from './slug.js';

const DEFAULT_FREE_GAMES_URL =
  'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=US&allowCountries=US';
const EPIC_GAMES_ALLOWED_HOSTS = new Set([
  'store-site-backend-static.ak.epicgames.com',
  'store-site-backend-static-ipv4.ak.epicgames.com',
]);
const EPIC_GAMES_REQUEST_TIMEOUT_MS = 10_000;

type JsonRecord = Record<string, unknown>;

@Injectable()
export class EpicGamesClientService {
  constructor(private readonly configService: ConfigService) {}

  async getFreeGameOffers(): Promise<EpicGamesOffer[]> {
    const endpoint = this.getEndpoint();
    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(EPIC_GAMES_REQUEST_TIMEOUT_MS),
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Epic Games request failed with HTTP ${response.status}`);
    }

    return this.parseFreeGameOffers(await response.json());
  }

  private getEndpoint(): URL {
    const configuredEndpoint = this.configService.get<string>(
      'EPIC_GAMES_FREE_GAMES_URL',
    );
    const endpoint = new URL(configuredEndpoint ?? DEFAULT_FREE_GAMES_URL);

    if (
      endpoint.protocol !== 'https:' ||
      !EPIC_GAMES_ALLOWED_HOSTS.has(endpoint.hostname)
    ) {
      throw new Error(
        `Invalid Epic Games endpoint host: ${endpoint.hostname || 'unknown'}`,
      );
    }

    return endpoint;
  }

  parseFreeGameOffers(payload: unknown): EpicGamesOffer[] {
    const elements = this.getElements(payload);

    return elements.flatMap((element) => this.parseElement(element));
  }

  private getElements(payload: unknown): JsonRecord[] {
    const root = asRecord(payload);
    const data = asRecord(root.data);
    const catalog = asRecord(data.Catalog);
    const searchStore = asRecord(catalog.searchStore);
    const elements = searchStore.elements;

    return Array.isArray(elements) ? elements.filter(isRecord) : [];
  }

  private parseElement(element: JsonRecord): EpicGamesOffer[] {
    const title = asString(element.title);
    const providerGameId =
      asString(element.id) ?? asString(element.namespace) ?? title;

    if (!title || !providerGameId) {
      return [];
    }

    return this.getPromotionalWindows(element).map(
      ({ startDate, endDate }) => ({
        providerGameId,
        providerNamespace: asString(element.namespace),
        title,
        slug: asString(element.productSlug) ?? slugify(title),
        developer: this.getCustomAttribute(element, 'developerName'),
        publisher:
          this.getSellerName(element) ??
          this.getCustomAttribute(element, 'publisherName'),
        startDate,
        endDate,
      }),
    );
  }

  private getPromotionalWindows(
    element: JsonRecord,
  ): Array<{ startDate: Date; endDate: Date }> {
    const promotions = asRecord(element.promotions);
    const currentPromotions = getPromotionGroups(promotions.promotionalOffers);
    const upcomingPromotions = getPromotionGroups(
      promotions.upcomingPromotionalOffers,
    );

    return [...currentPromotions, ...upcomingPromotions].flatMap((group) =>
      group.flatMap((promotion) => {
        const startDate = parseDate(asString(promotion.startDate));
        const endDate = parseDate(asString(promotion.endDate));

        return startDate && endDate && isFreePromotion(promotion)
          ? [{ startDate, endDate }]
          : [];
      }),
    );
  }

  private getCustomAttribute(
    element: JsonRecord,
    key: string,
  ): string | undefined {
    const customAttributes = element.customAttributes;

    if (!Array.isArray(customAttributes)) {
      return undefined;
    }

    const attribute = customAttributes
      .filter(isRecord)
      .find((item) => asString(item.key) === key);

    return attribute ? asString(attribute.value) : undefined;
  }

  private getSellerName(element: JsonRecord): string | undefined {
    return asString(asRecord(element.seller).name);
  }
}

function getPromotionGroups(value: unknown): JsonRecord[][] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((group) => {
    const promotionalOffers = group.promotionalOffers;

    return Array.isArray(promotionalOffers)
      ? promotionalOffers.filter(isRecord)
      : [];
  });
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function isFreePromotion(promotion: JsonRecord): boolean {
  const discountSetting = asRecord(promotion.discountSetting);

  return discountSetting.discountPercentage === 0;
}

function asRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
