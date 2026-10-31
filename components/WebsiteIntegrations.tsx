"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initializeTracking } from "@/lib/tracking/runtime";
import type { WebsiteIntegrations as Config } from "@/lib/tracking/types";

export function WebsiteIntegrations({
  schoolId,
  config,
  hostScope = false,
}: {
  schoolId: string;
  config?: Config;
  hostScope?: boolean;
}) {
  const pathname = usePathname();
  useEffect(() => {
    if (hostScope && pathname.startsWith("/embed/")) return;
    void initializeTracking(schoolId, config).catch(() => {
      console.warn("Website integrations could not be initialized.");
    });
  }, [schoolId, config, hostScope, pathname]);
  return null;
}
