import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

interface AuditPayload {
  shareId: string;
  result: import("@shared/audit").AuditResult;
  useCase: string;
  teamSize: number;
  createdAt: number;
}

/** Loads an audit by shareId. Prefers a locally cached result for instant render
 * on the audit page, then fetches the canonical payload from the backend. */
export function useAudit(shareId: string | undefined) {
  const [data, setData] = useState<AuditPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!shareId) {
        setError("Missing audit id");
        setLoading(false);
        return;
      }
      // Instant local cache (private audit page only).
      try {
        const cached = localStorage.getItem(`audit:${shareId}`);
        if (cached) {
          const result = JSON.parse(cached);
          setData({ shareId, result, useCase: "mixed", teamSize: 1, createdAt: Date.now() });
          setLoading(false);
        }
      } catch {
        /* ignore */
      }

      try {
        const res = await apiRequest("GET", `/api/audits/${shareId}`);
        const payload = await res.json();
        if (active) {
          setData(payload);
          setLoading(false);
        }
      } catch (e) {
        if (active) {
          // If we have a cache, keep showing it; only error if nothing cached.
          setError((prev) => prev ?? String(e));
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [shareId]);

  return { data, loading, error };
}
