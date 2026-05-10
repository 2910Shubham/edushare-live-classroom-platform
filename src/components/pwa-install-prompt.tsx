"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function PwaInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Register service worker if supported
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
      });
    }

    // Check if dismissed previously
    if (localStorage.getItem("pwaPromptDismissed") === "true") {
      setIsDismissed(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("pwaPromptDismissed", "true");
  };

  if (!isInstallable || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-xl border border-[rgba(108,99,255,0.12)] bg-white p-4 shadow-[0_8px_32px_rgba(108,99,255,0.12)] sm:top-6 sm:left-auto sm:right-6 sm:max-w-sm animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6c63ff]/10 text-[#6c63ff]">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#2D2B55]">Install EduShare</span>
          <span className="text-xs text-slate-500 text-left">Add to your home screen for quick access</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="rounded-lg bg-[#6c63ff] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5a52d5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6c63ff] focus:ring-offset-2"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
