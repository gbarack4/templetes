import { NextResponse, type NextRequest } from "next/server";
import { schoolDomainFromHost } from "@/lib/school-domain";

const SYSTEM_PATHS = [
  "/api",
  "/_next",
  "/dashboard",
  "/embed",
  "/login",
  "/sign-up",
  "/student-signup-complete",
  "/preview",
];

export default function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  if (
    /\.[^/]+$/.test(url.pathname) ||
    SYSTEM_PATHS.some(
      (path) => url.pathname === path || url.pathname.startsWith(`${path}/`),
    )
  )
    return NextResponse.next();
  const domain = schoolDomainFromHost(
    req.headers.get("host") || "",
    process.env.NEXT_PUBLIC_BASE_DOMAIN,
  );
  if (!domain) return NextResponse.next();
  url.pathname =
    domain === "preview"
      ? `/preview${url.pathname}`
      : `/${domain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
