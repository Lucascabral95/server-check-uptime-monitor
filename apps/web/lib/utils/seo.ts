import { Metadata } from "next";

const siteConfig = {
  name: "Server Check",
  url: process.env.NEXT_PUBLIC_URL_FRONTEND || "https://tu-dominio-real.com",
  ogImage: "/og-image.png", 
  twitterHandle: "@servercheck",
};

interface ConstructMetadataProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title = siteConfig.name, 
  description = "Monitor your servers and websites 24/7",
  image = siteConfig.ogImage,
  noIndex = false,
}: ConstructMetadataProps = {}): Metadata {
  
  return {
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    openGraph: {
      title,
      description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
      locale: "es_ES", 
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: siteConfig.twitterHandle,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: "./",
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}
