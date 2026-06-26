import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;
const SYSTEM_PATHS = ["/api", "/_next", "/favicon.ico", "/robots.txt"];

export default function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host");

  if (!hostname) {
    return NextResponse.next();
  }

  const isSystemPath = SYSTEM_PATHS.some((path) =>
    url.pathname.startsWith(path),
  );
  if (PUBLIC_FILE.test(url.pathname) || isSystemPath) {
    return NextResponse.next();
  }

  const isLocalhost = hostname.includes("localhost");
  const baseDomain = isLocalhost
    ? "localhost:3000"
    : process.env.NEXT_PUBLIC_BASE_DOMAIN;

  if (hostname === baseDomain) {
    return NextResponse.next();
  }

  let domain = hostname;

  if (isLocalhost) {
    const parts = hostname.split(".");
    if (parts.length > 1) {
      domain = parts[0];
    }
  }

  url.pathname = `/${domain}${url.pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
