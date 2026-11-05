"use client";

import { useRef, useState } from "react";
import { IconCheck } from "./ui";

/** Clipboard write with a textarea fallback for http:// / older browsers. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

const IconCopy = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </svg>
);

export function CopyButton({
  text,
  label,
  doneLabel,
  failLabel,
  hideLabel = false,
}: {
  text: string;
  label: string;
  doneLabel: string;
  failLabel: string;
  /** Icon-only on screen (label still read by screen readers). */
  hideLabel?: boolean;
}) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function onClick() {
    const ok = await copyText(text);
    setState(ok ? "done" : "fail");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  }

  const shown =
    state === "done" ? doneLabel : state === "fail" ? failLabel : label;
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[10px] border border-line bg-surface px-3 text-sm font-semibold text-brand transition-colors hover:border-brand hover:bg-brand-soft"
      >
        {state === "done" ? <IconCheck width={18} height={18} /> : <IconCopy />}
        <span className={hideLabel ? "sr-only" : ""}>{shown}</span>
      </button>
      <span role="status" className="sr-only">
        {state === "idle" ? "" : shown}
      </span>
    </>
  );
}
