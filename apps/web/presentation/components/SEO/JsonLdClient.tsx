"use client";

import { useEffect } from "react";

interface JsonLdClientProps {
  data: Record<string, unknown>;
}

export function JsonLdClient({ data }: JsonLdClientProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    script.id = "json-ld-client";

    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById("json-ld-client");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [data]);

  return null;
}

export function useDashboardStructuredData(
  monitorCount?: number,
  uptimePercentage?: number
) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Server Check Dashboard",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating:
      monitorCount && monitorCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: uptimePercentage ? uptimePercentage / 20 : 4.5,
            ratingCount: monitorCount,
          }
        : undefined,
  };
}
