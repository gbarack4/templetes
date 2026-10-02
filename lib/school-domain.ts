export function schoolDomainFromHost(
  host: string,
  baseDomain = "driveinstructor.pro",
): string | null {
  const clean = host.trim().toLowerCase();
  if (!clean || /[\s/@\\?#]/.test(clean)) return null;
  let hostname: string;
  try {
    hostname = new URL(`http://${clean}`).hostname;
  } catch {
    return null;
  }
  const base = baseDomain.trim().toLowerCase().replace(/:\d+$/, "");
  if ([base, "localhost", "127.0.0.1", "[::1]"].includes(hostname)) return null;
  for (const suffix of [".localhost", `.${base}`]) {
    if (hostname.endsWith(suffix)) return hostname.slice(0, -suffix.length) || null;
  }
  return hostname;
}

export function safeRedirect(value: string | null, fallback = "/dashboard"): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  )
    return fallback;
  try {
    const url = new URL(value, "https://student.invalid");
    return url.origin === "https://student.invalid"
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
