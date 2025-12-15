// Google Analytics event tracking utility

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  try {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', eventName, eventParams);
    } else {
      // Fallback: push to dataLayer if gtag is not yet loaded
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        ...eventParams,
      });
    }
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
}

export function trackPageView(path: string) {
  if (typeof window === 'undefined') return;

  try {
    if (window.gtag) {
      window.gtag('config', 'G-C6S1KJ10YT', {
        page_path: path,
      });
    }
  } catch (error) {
    console.error('[Analytics] Error tracking page view:', error);
  }
}

// Specific event helpers
export function trackUpgradeButtonClick(source: string) {
  trackEvent('upgrade_button_click', {
    button_source: source,
    event_category: 'engagement',
    event_label: source,
  });
}

export function trackUpgradeModalView() {
  trackEvent('upgrade_modal_view', {
    event_category: 'engagement',
  });
}

