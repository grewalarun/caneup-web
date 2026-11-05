"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { IconChevron, Spinner } from "./ui";

export type ComboOption = { value: string; label: string; hint?: string };

export type ComboStrings = {
  select: string;
  loading: string;
  noMatches: string;
  /** shown when the list itself is empty (not just filtered out) */
  empty: string;
  showing: (n: number, total: number) => string;
};

const MAX_RENDERED = 100;

/** Accessible searchable select (ARIA 1.2 combobox with listbox popup). */
export function Combobox({
  label,
  name,
  options,
  value,
  onChange,
  disabled,
  loading,
  error,
  placeholder,
  strings,
}: {
  label: string;
  name: string;
  options: ComboOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  placeholder?: string;
  strings: ComboStrings;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const errId = `${id}-err`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      `${o.label} ${o.hint ?? ""} ${o.value}`.toLowerCase().includes(q),
    );
  }, [options, query]);
  const shown = matches.slice(0, MAX_RENDERED);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (open)
      listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function choose(o: ComboOption) {
    onChange(o.value);
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        else setActive((a) => Math.min(a + 1, shown.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(shown.length - 1);
        }
        break;
      case "Enter":
        if (open && shown[active]) {
          e.preventDefault();
          choose(shown[active]);
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
          setQuery("");
        }
        break;
      case "Tab":
        setOpen(false);
        setQuery("");
        break;
    }
  }

  const display = open ? query : (selected?.label ?? "");
  const emptyText = options.length === 0 ? strings.empty : strings.noMatches;

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && shown[active] ? `${id}-opt-${active}` : undefined
          }
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="done"
          disabled={disabled}
          value={display}
          placeholder={
            loading ? strings.loading : (placeholder ?? strings.select)
          }
          onFocus={() => {
            setOpen(true);
            setActive(0);
          }}
          onClick={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          className="min-h-12 w-full rounded-[10px] border border-line bg-surface px-3.5 pr-11 text-base text-ink placeholder:text-muted disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-60 aria-[invalid=true]:border-chilli hover:enabled:border-brand"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-muted"
        >
          {loading ? <Spinner /> : <IconChevron width={18} height={18} />}
        </span>
      </div>

      {open && !disabled && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute z-30 mt-1.5 max-h-72 w-full overflow-auto overscroll-contain rounded-[12px] border border-line bg-surface py-1.5 shadow-sheet"
        >
          {shown.length === 0 && (
            <li role="presentation" className="px-4 py-3 text-muted">
              {loading ? strings.loading : emptyText}
            </li>
          )}
          {shown.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={o.value === value}
              onMouseEnter={() => setActive(i)}
              onPointerDown={(e) => {
                e.preventDefault();
                choose(o);
              }}
              className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 py-2 ${
                i === active ? "bg-brand-soft" : ""
              } ${o.value === value ? "font-bold" : ""}`}
            >
              <span className="min-w-0 break-words">{o.label}</span>
              {o.hint && (
                <span className="shrink-0 text-sm text-muted tabular">
                  {o.hint}
                </span>
              )}
            </li>
          ))}
          {matches.length > MAX_RENDERED && (
            <li role="presentation" className="px-4 py-2 text-sm text-muted">
              {strings.showing(MAX_RENDERED, matches.length)}
            </li>
          )}
        </ul>
      )}
      {error && (
        <p
          id={errId}
          role="alert"
          className="mt-1.5 text-sm font-medium text-chilli"
        >
          {error}
        </p>
      )}
    </div>
  );
}
