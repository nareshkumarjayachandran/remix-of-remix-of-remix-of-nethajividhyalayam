/**
 * ConnectivityBanner — detects when backend API calls fail (e.g. Jio/JioFiber blocking)
 * and shows users DNS fix instructions to resolve the issue.
 */
import { useState, useEffect, useCallback } from "react";
import { WifiOff, X, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const CHECK_INTERVAL = 60_000; // 60s between checks
const DISMISS_KEY = "connectivity-banner-dismissed";
const FAILURES_THRESHOLD = 3; // require 3 consecutive failures

export default function ConnectivityBanner() {
  const [backendBlocked, setBackendBlocked] = useState(false);
  const failCountRef = { current: 0 };

  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      const val = sessionStorage.getItem(DISMISS_KEY);
      return val === "true";
    } catch { return false; }
  });

  const checkBackend = useCallback(async () => {
    if (!SUPABASE_URL || !navigator.onLine) return;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: "HEAD",
        signal: controller.signal,
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      clearTimeout(timeout);
      if (res.ok) {
        failCountRef.current = 0;
        setBackendBlocked(false);
      } else {
        failCountRef.current++;
        if (failCountRef.current >= FAILURES_THRESHOLD) setBackendBlocked(true);
      }
    } catch {
      failCountRef.current++;
      if (failCountRef.current >= FAILURES_THRESHOLD) setBackendBlocked(true);
    }
  }, []);

  useEffect(() => {
    if (dismissed) return;
    checkBackend();
    const id = setInterval(checkBackend, CHECK_INTERVAL);
    return () => clearInterval(id);
  }, [checkBackend, dismissed]);

  // Auto-hide when backend becomes reachable
  useEffect(() => {
    if (!backendBlocked) setExpanded(false);
  }, [backendBlocked]);

  if (!backendBlocked || dismissed) return null;

  return (
    <div
      className={cn(
        "w-full bg-amber-500 text-amber-950 text-sm transition-all duration-300 z-[100] relative"
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Collapsed bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
          <span className="font-semibold truncate">
            ⚠️ Connection issue detected — Some features may not work
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 transition-colors text-xs font-bold"
          >
            {expanded ? "Hide" : "Fix it"}
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <button
            onClick={() => {
              setDismissed(true);
              try { sessionStorage.setItem(DISMISS_KEY, "true"); } catch {}
            }}
            className="p-1 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded instructions */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-amber-600/30 pt-3">
          <p className="text-xs leading-relaxed">
            Some Indian ISPs (especially <strong>Jio & JioFiber</strong>) block certain cloud services.
            You can fix this by changing your DNS settings:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Android */}
            <div className="bg-amber-400/40 rounded-lg p-3 space-y-1">
              <h4 className="font-bold text-xs flex items-center gap-1">
                <Shield className="h-3 w-3" /> Android / iPhone
              </h4>
              <ol className="text-[11px] leading-relaxed list-decimal list-inside space-y-0.5">
                <li>Open <strong>Settings → Wi-Fi</strong></li>
                <li>Tap your connected network → <strong>Advanced</strong></li>
                <li>Change DNS to <strong>Manual</strong></li>
                <li>Set DNS 1: <code className="bg-amber-300/50 px-1 rounded">1.1.1.1</code></li>
                <li>Set DNS 2: <code className="bg-amber-300/50 px-1 rounded">8.8.8.8</code></li>
                <li>Save & reconnect</li>
              </ol>
            </div>

            {/* Router */}
            <div className="bg-amber-400/40 rounded-lg p-3 space-y-1">
              <h4 className="font-bold text-xs flex items-center gap-1">
                <Shield className="h-3 w-3" /> JioFiber Router (fix for all devices)
              </h4>
              <ol className="text-[11px] leading-relaxed list-decimal list-inside space-y-0.5">
                <li>Open <code className="bg-amber-300/50 px-1 rounded">192.168.29.1</code> in browser</li>
                <li>Login → <strong>Network → DNS</strong></li>
                <li>Set Primary: <code className="bg-amber-300/50 px-1 rounded">1.1.1.1</code></li>
                <li>Set Secondary: <code className="bg-amber-300/50 px-1 rounded">8.8.8.8</code></li>
                <li>Save & restart router</li>
              </ol>
            </div>
          </div>

          <p className="text-[10px] opacity-70 text-center">
            Or try using <strong>mobile data (Airtel/Vi)</strong> instead of JioFiber • 
            <button onClick={() => { checkBackend(); }} className="underline ml-1 font-semibold">
              Re-check connection
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
