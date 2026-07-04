"use client";

import { useEffect, useMemo, useState } from "react";

type FreeOffer = {
  id: string;
  startDate: string;
  endDate: string;
  game: {
    title: string;
  };
  store: {
    name: string;
  };
};

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; offers: FreeOffer[] }
  | { status: "error"; message: string };

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";

export default function Home() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadOffers() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/free-offers`, {
          signal: controller.signal,
          headers: {
            accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Free offers request failed with ${response.status}`);
        }

        const offers = (await response.json()) as FreeOffer[];
        setState({ status: "loaded", offers });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load free offers.",
        });
      }
    }

    void loadOffers();

    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-[#f3f5f6] text-[#171717]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-3 border-b border-[#d3d8dc] pb-6">
          <p className="text-sm font-medium uppercase text-[#5f6971]">
            ClaimWeekGames
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#111111] sm:text-4xl">
                Epic free offers
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-[#53606a]">
                Current Epic Games Store free offers tracked by the backend
                sync pipeline.
              </p>
            </div>
            <p className="text-sm text-[#5f6971]">Source: {apiBaseUrl}</p>
          </div>
        </header>

        {state.status === "loading" ? <LoadingState /> : null}
        {state.status === "error" ? <ErrorState message={state.message} /> : null}
        {state.status === "loaded" ? (
          <OffersList offers={state.offers} />
        ) : null}
      </section>
    </main>
  );
}

function OffersList({ offers }: { offers: FreeOffer[] }) {
  const sortedOffers = useMemo(
    () =>
      [...offers].sort(
        (a, b) =>
          new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
      ),
    [offers],
  );

  if (sortedOffers.length === 0) {
    return (
      <section className="border border-[#d3d8dc] bg-white p-6">
        <h2 className="text-xl font-semibold">No active free offers</h2>
        <p className="mt-2 text-[#53606a]">
          The API is reachable, but there are no current offers in the database.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {sortedOffers.map((offer) => (
        <article
          key={offer.id}
          className="border border-[#d3d8dc] bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#111111]">
                {offer.game.title}
              </h2>
              <p className="mt-1 text-sm text-[#5f6971]">{offer.store.name}</p>
            </div>
            <span className={statusClassName(getOfferStatus(offer))}>
              {getOfferStatus(offer)}
            </span>
          </div>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-[#5f6971]">Starts</dt>
              <dd className="mt-1 text-[#222222]">
                {formatDate(offer.startDate)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[#5f6971]">Ends</dt>
              <dd className="mt-1 text-[#222222]">
                {formatDate(offer.endDate)}
              </dd>
            </div>
          </dl>
        </article>
      ))}
    </section>
  );
}

function LoadingState() {
  return (
    <section className="border border-[#d3d8dc] bg-white p-6">
      <p className="text-[#53606a]">Loading Epic free offers...</p>
    </section>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="border border-[#b85c4c] bg-[#fff8f6] p-6">
      <h2 className="text-xl font-semibold text-[#681f16]">
        Offers could not be loaded
      </h2>
      <p className="mt-2 text-[#7b3a31]">{message}</p>
    </section>
  );
}

function getOfferStatus(offer: FreeOffer): "active" | "upcoming" | "expired" {
  const now = Date.now();
  const startDate = new Date(offer.startDate).getTime();
  const endDate = new Date(offer.endDate).getTime();

  if (Number.isFinite(startDate) && now < startDate) {
    return "upcoming";
  }

  if (Number.isFinite(endDate) && now > endDate) {
    return "expired";
  }

  return "active";
}

function statusClassName(status: "active" | "upcoming" | "expired") {
  const base =
    "shrink-0 border px-2 py-1 text-xs font-semibold uppercase";

  if (status === "active") {
    return `${base} border-[#5e8f61] bg-[#edf6ec] text-[#2f6533]`;
  }

  if (status === "upcoming") {
    return `${base} border-[#947744] bg-[#fff7df] text-[#6a4b12]`;
  }

  return `${base} border-[#9b9b9b] bg-[#eeeeea] text-[#555555]`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
