import { NextRequest, NextResponse } from "next/server";

const DOMAIN_SUFFIX = ".driveinstructor.pro";

type DomainCheckResponse = {
  allowed: boolean;
};

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain");

  if (!domain) {
    return new NextResponse("Domain required", { status: 400 });
  }

  const normalizedDomain = domain.trim().toLowerCase();

  if (!normalizedDomain.endsWith(DOMAIN_SUFFIX)) {
    return new NextResponse(null, { status: 403 });
  }

  const slug = normalizedDomain.slice(0, -DOMAIN_SUFFIX.length);

  if (!slug || slug.includes(".")) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/websites/check-domain/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return new NextResponse(null, { status: 403 });
    }

    const { allowed } = (await response.json()) as DomainCheckResponse;

    if (!allowed) {
      return new NextResponse(null, { status: 403 });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Failed to validate Caddy domain:", error);

    return new NextResponse(null, { status: 503 });
  }
}
