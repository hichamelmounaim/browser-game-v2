"use client";

import { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { SiteSettings } from '@/lib/db';

export default function CookieManager({ settings, lang }: { settings: SiteSettings, lang: string }) {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'true') {
      setConsentGiven(true);
    } else if (consent === 'false') {
      setConsentGiven(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setConsentGiven(true);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'false');
    setConsentGiven(false);
  };

  return (
    <>
      {/* Scripts only loaded if consent is given */}
      {consentGiven && settings.google_analytics_id && (
        <>
          <Script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.google_analytics_id}');
            `}
          </Script>
        </>
      )}

      {consentGiven && settings.google_adsense_id && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.google_adsense_id}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      {/* Cookie Banner */}
      {consentGiven === null && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-full duration-500">
          <div className="max-w-4xl mx-auto bg-surface-white border border-outline-variant/20 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">cookie</span>
                We value your privacy
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                We use cookies to personalize content and ads, to provide social media features and to analyze our traffic. We also share information about your use of our site with our social media, advertising and analytics partners.
                <Link href={`/${lang}/privacy`} className="text-primary hover:underline ml-1">Read more in our Privacy Policy</Link>.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button 
                onClick={handleDecline}
                className="px-6 py-2.5 rounded-full border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container transition-colors text-sm"
              >
                Decline
              </button>
              <button 
                onClick={handleAccept}
                className="px-6 py-2.5 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-colors text-sm shadow-sm"
              >
                Accept Cookies
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
