"use client";

import { useEffect, useState } from "react";

/**
 * Total visits, read through our own /api/visits route (GoatCounter token stays server-side). Renders nothing until the number arrives, and
 * nothing at all if the counter is disabled or blocked, so the footer never shows an error.
 */
export function VisitorCount({ label }: { label: string }) {
  const [count, setCount] = useState("");
  useEffect(() => {
    const ac = new AbortController();
    fetch("https://caneup.goatcounter.com/counter/TOTAL.json", {
      signal: ac.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: { count?: string }) => j.count && setCount(j.count))
      .catch(() => {});
    return () => ac.abort();
  }, []);
  if (!count) return null;
  return (
    <p className="mt-2">
      {label}: <strong className="tabular">{count}</strong>
    </p>
  );
}
