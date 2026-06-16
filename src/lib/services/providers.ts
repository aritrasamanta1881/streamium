import { browser } from "$app/environment";
import { get } from "svelte/store";
import { providerUrls } from "$lib/stores/provider-urls";

export interface Provider {
  id: string;
  name: string;
  getEmbedUrl: (
    mediaId: string | number,
    type: "movie" | "tv",
    season?: number,
    episode?: number,
  ) => string;
}

export const providers: Provider[] = [
{
    id: "vidsrcpro",
    name: "VidSrc Pro",
    getEmbedUrl: (mediaId, type, season, episode) => {
      const urls = get(providerUrls);
      if (!urls) return "";

      if (type === "movie") {
        return `${urls.vidsrcpro}/movie/${mediaId}`;
      } else {

        if (typeof season !== "undefined" && typeof episode !== "undefined") {
          return `${urls.vidsrcpro}/tv/${mediaId}/${season}/${episode}`;
        }
        return `${urls.vidsrcpro}/tv/${mediaId}`;
      }
    },
  },
  {
    id: "vidlink",
    name: "VidLink",
    getEmbedUrl: (mediaId, type, season, episode) => {
      const urls = get(providerUrls);
      if (!urls?.vidlink) return "";

      if (type === "movie") {
        return `${urls.vidlink}/movie/${mediaId}?autoplay=true&title=true`;
      } else {
        if (typeof season !== "undefined" && typeof episode !== "undefined") {
          return `${urls.vidlink}/tv/${mediaId}/${season}/${episode}?autoplay=true&title=true`;
        }
        return `${urls.vidlink}/tv/${mediaId}/1/1?autoplay=true&title=true`;
      }
    },
  },
  
  {
    id: "2embed",
    name: "2Embed",
    getEmbedUrl: (mediaId, type, season, episode) => {
      const urls = get(providerUrls);
      if (!urls?.embed2) return "";

      if (type === "movie") {
        return `${urls.embed2}/embed/${mediaId}`;
      } else {
        if (typeof season !== "undefined" && typeof episode !== "undefined") {
          return `${urls.embed2}/embedtv/${mediaId}&s=${season}&e=${episode}`;
        }
        return `${urls.embed2}/embedtv/${mediaId}&s=1&e=1`;
      }
    },
  },
];

export function getProvider(id: string): Provider | undefined {
  return providers.find((p) => p.id === id);
}

export function getDefaultProvider(): Provider {
  if (!browser) {
    return providers[0];
  }

  const savedProvider = localStorage.getItem("selectedProvider");
  if (savedProvider) {
    const provider = providers.find((p) => p.id === savedProvider);
    if (provider) return provider;
  }

  return providers.find((p) => p.id === "vidsrc") || providers[0];
}
