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
    <div className="fixed top-4 left-4 right-4 z-[100] sm:left-auto sm:right-6 sm:w-[360px] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#6c63ff] text-white shadow-sm">
            <Download className="h-6 w-6" />
          </div>
          <div className="flex flex-col flex-1 pt-0.5">
            <h3 className="text-[15px] font-bold text-slate-900 leading-tight">Install EduShare</h3>
            <p className="text-[13px] text-slate-500 mt-1 leading-snug">Add to home screen for a seamless experience.</p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1.5 -mt-1 -mr-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center rounded-xl bg-[#6c63ff] py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-[#5a52d5] transition-colors"
          >
            Install App Now
          </button>
        </div>
      </div>
    </div>
  );
}
