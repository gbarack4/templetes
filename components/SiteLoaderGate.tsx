"use client";

import { useLayoutEffect, useState } from "react";
import { SiteLoader } from "./SiteLoader";

const MIN_VISIBLE_MS = 700;

type SiteLoaderGateProps = Readonly<{
  children: React.ReactNode;
}>;

export function SiteLoaderGate({ children }: SiteLoaderGateProps) {
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    document.body.classList.add("site-is-loading");
    const startedAt = Date.now();
    let timeoutId: number | undefined;

    function finish() {
      const remaining = MIN_VISIBLE_MS - (Date.now() - startedAt);
      timeoutId = window.setTimeout(() => {
        setIsLoading(false);
        document.body.classList.remove("site-is-loading");
      }, Math.max(remaining, 0));
    }

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      window.removeEventListener("load", finish);
      document.body.classList.remove("site-is-loading");
    };
  }, []);

  return (
    <>
      {isLoading ? <SiteLoader /> : null}
      <div className={isLoading ? "invisible" : undefined}>{children}</div>
    </>
  );
}
