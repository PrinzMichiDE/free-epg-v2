"use client";

import { useCallback, useEffect } from "react";
import type { PlaylistPlayerEntry } from "@/lib/playlists";

interface UseChannelNavigationOptions {
  entries: PlaylistPlayerEntry[];
  activeId: string | null;
  onSelect: (entryId: string) => void;
  enabled?: boolean;
}

export function useChannelNavigation({
  entries,
  activeId,
  onSelect,
  enabled = true,
}: UseChannelNavigationOptions) {
  const selectOffset = useCallback(
    (offset: number) => {
      if (entries.length === 0) return;
      const currentIndex = entries.findIndex((entry) => entry.id === activeId);
      const baseIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex = (baseIndex + offset + entries.length) % entries.length;
      onSelect(entries[nextIndex]!.id);
    },
    [activeId, entries, onSelect]
  );

  const selectPrevious = useCallback(() => selectOffset(-1), [selectOffset]);
  const selectNext = useCallback(() => selectOffset(1), [selectOffset]);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowUp":
        case "PageUp":
          event.preventDefault();
          selectPrevious();
          break;
        case "ArrowDown":
        case "PageDown":
          event.preventDefault();
          selectNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, selectNext, selectPrevious]);

  return { selectPrevious, selectNext };
}
