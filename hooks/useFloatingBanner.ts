"use client";

import { useCallback, useState } from "react";

type BannerType = "success" | "info" | "warning";

interface UseFloatingBannerReturn {
  bannerMessage: string | null;
  bannerType: BannerType | null;
  showBanner: (message: string, type?: BannerType) => void;
}

export function useFloatingBanner(): UseFloatingBannerReturn {
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [bannerType, setBannerType] = useState<BannerType | null>(null);

  const showBanner = useCallback((message: string, type: BannerType = "info") => {
    setBannerMessage(message);
    setBannerType(type);
    setTimeout(() => {
      setBannerMessage(null);
      setBannerType(null);
    }, 3000);
  }, []);

  return { bannerMessage, bannerType, showBanner };
}
