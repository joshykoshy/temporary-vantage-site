import { useSyncExternalStore } from "react";

/** Live media-query match; false on the server so hydration never mismatches. */
export const useMedia = (q: string) =>
  useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(q);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(q).matches,
    () => false,
  );
