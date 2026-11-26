"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwaPromptDismissed";

// Spacing is set with inline styles on purpose: a global CSS reset
// (e.g. `* { padding: 0; margin: 0 }`) can override Tailwind padding/margin
// utilities, which is what made the card content touch the edges.
const buttonBase: React.CSSProperties = {
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  height: 44,
  padding: "0 16px",
  borderRadius: 10,
  fontSize: 14,
  lineHeight: 1,
  cursor: "pointer",
};

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const register = () =>
        navigator.serviceWorker
          .register("/sw.js")
          .catch((err) => console.error("Service Worker registration failed:", err));

      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once: true });
    }

    try {
      setIsDismissed(localStorage.getItem(DISMISS_KEY) === "true");
    } catch {
      setIsDismissed(false);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => setDeferredPrompt(null);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      /* ignore */
    }
  };

  if (!deferredPrompt || isDismissed) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
      className="fixed inset-x-4 bottom-4 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300 sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-6 sm:w-[380px]"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_-8px_rgba(15,23,42,0.25)]"
        style={{ padding: 20 }}
      >
        {/* Brand accent bar */}
        <div
          className="absolute inset-x-0 top-0 bg-gradient-to-r from-[#6c63ff] to-[#8b84ff]"
          style={{ height: 4 }}
        />

        <button
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="absolute rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          style={{
            top: 14,
            right: 14,
            padding: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X className="h-4 w-4" />
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, paddingRight: 28 }}>
          <div
            className="bg-gradient-to-br from-[#6c63ff] to-[#8b84ff] text-white shadow-md"
            style={{
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Download className="h-6 w-6" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              id="pwa-install-title"
              className="text-[15px] font-semibold leading-tight text-slate-900"
              style={{ margin: 0 }}
            >
              Install EduShare
            </h3>
            <p
              id="pwa-install-desc"
              className="text-[13px] leading-snug text-slate-500"
              style={{ margin: "4px 0 0" }}
            >
              Add it to your home screen for faster access and an app-like
              experience.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button
            onClick={handleDismiss}
            className="border border-slate-200 bg-white font-medium text-slate-600 transition-colors hover:bg-slate-50"
            style={buttonBase}
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            className="border-0 bg-[#6c63ff] font-semibold text-white shadow-sm transition-all hover:bg-[#5a52d5] active:scale-[0.98]"
            style={buttonBase}
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}