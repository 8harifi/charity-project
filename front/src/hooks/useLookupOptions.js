import { useState, useEffect } from "react";

/** @param {() => Promise<{label: string, value: number}[]>} loader */
export function useLookupOptions(loader) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loader()
      .then((rows) => {
        if (!cancelled) {
          setOptions(rows);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- loader is a stable lookupApi method
  }, []);

  return { options, loading, error };
}

/** @param {Record<string, () => Promise<{label: string, value: number}[]>>} fetchers */
export function useMultipleLookups(fetchers) {
  const keys = Object.keys(fetchers);
  const [data, setData] = useState(() =>
    Object.fromEntries(keys.map((k) => [k, []]))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all(keys.map((k) => fetchers[k]()))
      .then((results) => {
        if (cancelled) return;
        const next = {};
        keys.forEach((k, i) => {
          next[k] = results[i];
        });
        setData(next);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...data, loading, error };
}

export function findLookupOption(options, saved) {
  if (saved == null || saved === "") return null;
  if (typeof saved === "object" && saved !== null && "value" in saved) {
    return (
      options.find((o) => o.value === saved.value) ||
      (saved.label ? saved : null)
    );
  }
  if (typeof saved === "number") {
    return options.find((o) => o.value === saved) || null;
  }
  if (typeof saved === "string") {
    return (
      options.find((o) => o.label === saved) ||
      options.find((o) => String(o.value) === saved) ||
      null
    );
  }
  return null;
}
