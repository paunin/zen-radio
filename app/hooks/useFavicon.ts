import { useEffect } from "react";

export function useFavicon(isActive: boolean) {
  useEffect(() => {
    const icon16 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="16x16"]');
    const icon32 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="32x32"]');

    if (icon16) {
      icon16.href = isActive ? "/images/icon16_active.png" : "/images/icon16.png";
    }
    if (icon32) {
      icon32.href = isActive ? "/images/icon32_active.png" : "/images/icon32.png";
    }
  }, [isActive]);
}
