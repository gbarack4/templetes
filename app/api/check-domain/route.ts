import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain");

  if (!domain) {
    return new NextResponse("Domain required", { status: 400 });
  }

  console.log(`Caddy checking domain: ${domain}`);

  return new NextResponse(null, { status: 200 });
}
