import { NextRequest, NextResponse } from "next/server";
import {
  getAnalyzeSiteConfig,
  getAnalyzeSessionCookieName,
  type AnalyzeSiteConfig,
} from "./lib/siteConfig";
import { validatePlatformAdmin } from "./lib/platformAuth";

function configurationError(error: unknown) {
  const message = error instanceof Error ? error.message : "Siteni Analiz Et yapılandırması okunamadı.";
  return NextResponse.json({ message }, { status: 500 });
}

function reject(request: NextRequest, site: AnalyzeSiteConfig, status: number, message: string) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ message }, { status });
  }

  const loginUrl = new URL("/login", request.url);
  if (status === 503) loginUrl.searchParams.set("error", "api");
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(getAnalyzeSessionCookieName(site));
  return response;
}

export async function middleware(request: NextRequest) {
  let site: AnalyzeSiteConfig;

  try {
    site = getAnalyzeSiteConfig();
  } catch (error) {
    return configurationError(error);
  }

  if (request.nextUrl.pathname === "/login") {
    return site.authMode === "platform-admin"
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/", request.url));
  }

  if (site.authMode === "none") {
    return NextResponse.next();
  }

  const token = request.cookies.get(getAnalyzeSessionCookieName(site))?.value;
  if (!token) return reject(request, site, 401, "Yönetici girişi gerekli.");

  const authorization = await validatePlatformAdmin(site.authApiUrl, token);
  if (authorization.ok === false) {
    const status = authorization.status >= 500 ? 503 : 401;
    return reject(request, site, status, authorization.message);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/api/events", "/api/analyze/:path*"],
};
