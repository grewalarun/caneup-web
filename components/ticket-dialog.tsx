"use client";

import { useEffect, useRef } from "react";
import type { Lang } from "@/lib/client-api";
import { t } from "@/lib/i18n";
import { CopyButton } from "./copy-button";
import { Button } from "./ui";

export type TicketLine = { label: string; value: string };

/** Modal with every field of one supply ticket, like the app's ticket popup. */
export function TicketDialog({
  title,
  lines,
  lang,
  onClose,
}: {
  title: string;
  lines: TicketLine[];
  lang: Lang;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  const text = lines.map((l) => `${l.label} : ${l.value}`).join("\n");

  return (
    <dialog
      ref={ref}
      aria-labelledby="ticket-h"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-[min(92vw,34rem)] rounded-[8px] border-0 bg-surface p-0 text-ink shadow-sheet backdrop:bg-black/50"
    >
      <div className="flex items-center justify-between gap-3 bg-band px-5 py-4 text-band-ink">
        <h2 id="ticket-h" className="font-display text-xl font-bold">
          {title}
        </h2>
      </div>
      <div className="max-h-[70dvh] space-y-5 overflow-y-auto px-5 py-5">
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {lines.map((l) => (
            <div key={l.label} className="min-w-0">
              <dt className="text-sm font-bold">{l.label}</dt>
              <dd className="tabular break-words text-muted">{l.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-line px-5 py-4">
        <CopyButton
          text={text}
          label={t("copyDetails", lang)}
          doneLabel={t("copied", lang)}
          failLabel={t("copyFailed", lang)}
        />
        <Button onClick={() => ref.current?.close()}>{t("close", lang)}</Button>
      </div>
    </dialog>
  );
}
