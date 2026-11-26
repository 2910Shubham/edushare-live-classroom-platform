"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwaPromptDismissed";

const buttonBase: React.CSSProperties = {
  flex: 1,
  height: 44,
  padding: "0 16px",
  borderRadius: 16,
  fontSize: 14,
  lineHeight: 1,
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
      className="fixed inset-x-4 bottom-4 z-[100] clay-modal sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-6 sm:w-[380px]"
    >
      <div className="clay clay-md relative overflow-hidden">
        {/* Brand accent bar */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: 4,
            background: "linear-gradient(90deg, var(--clay-purple) 0%, var(--clay-teal) 100%)",
          }}
        />

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="absolute flex items-center justify-center rounded-full text-[var(--clay-ink-soft)] transition-colors hover:bg-[#ece8ff] hover:text-[var(--clay-ink)]"
          style={{
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <X className="h-4 w-4" />
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, paddingRight: 28 }}>
          <div
            className="clay-icon clay-icon-purple"
            style={{ width: 48, height: 48, borderRadius: 16 }}
            aria-hidden="true"
          >
            <Download className="h-6 w-6" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              id="pwa-install-title"
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                lineHeight: 1.25,
                color: "var(--clay-ink)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Install EduShare
            </h3>
            <p
              id="pwa-install-desc"
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                lineHeight: 1.45,
                color: "var(--clay-ink-soft)",
              }}
            >
              Add it to your home screen for faster access and an app-like
              experience.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button
            type="button"
            onClick={handleDismiss}
            className="clay-btn clay-btn-ghost clay-btn-sm"
            style={buttonBase}
          >
            Not now
          </button>
          <button
            type="button"
            onClick={handleInstallClick}
            className="clay-btn clay-btn-sm"
            style={buttonBase}
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
