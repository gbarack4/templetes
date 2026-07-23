import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;
const SYSTEM_PATHS = [
  "/api",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/dashboard",
  "/login",
  "/sign-up",
  "/sso-callback",
  "/__clerk",
];

function isLocalDev(req: NextRequest) {
  const host = req.headers.get("host") || "";
  return host.includes("localhost") || host.startsWith("127.0.0.1");
}

function isProtectedPath(pathname: string) {
  return pathname.startsWith("/dashboard");
}

function applyDomainRewrite(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host");

  if (!hostname) return NextResponse.next();

  const isSystemPath = SYSTEM_PATHS.some((path) =>
    url.pathname.startsWith(path),
  );
  if (PUBLIC_FILE.test(url.pathname) || isSystemPath) {
    return NextResponse.next();
  }

  const isLocalhost = hostname.includes("localhost");
  const baseDomain = isLocalhost
    ? `localhost:${url.port || "3002"}`
    : process.env.NEXT_PUBLIC_BASE_DOMAIN || "driveinstructor.pro";

  if (hostname === baseDomain) {
    return NextResponse.next();
  }

  if (hostname === `preview.${baseDomain}`) {
    url.pathname = `/preview${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  let domain = hostname;
  if (isLocalhost) {
    const parts = hostname.split(".");
    if (parts.length > 1) domain = parts[0];
  } else {
    domain = hostname.replace(`.${baseDomain}`, "");
  }

  url.pathname = `/${domain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export default clerkMiddleware(
  async (auth, req) => {
    // Skip auth on localhost so dashboard UI can be edited without signing in.
    if (isProtectedPath(req.nextUrl.pathname) && !isLocalDev(req)) {
      const { userId } = await auth();
      if (!userId) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set(
          "redirect_url",
          `${req.nextUrl.pathname}${req.nextUrl.search}`,
        );
        return NextResponse.redirect(loginUrl);
      }
    }

    return applyDomainRewrite(req);
  },
  {
    signInUrl: "/login",
    signUpUrl: "/sign-up",
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
