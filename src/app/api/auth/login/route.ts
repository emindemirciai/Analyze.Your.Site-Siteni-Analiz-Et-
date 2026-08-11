import { NextResponse } from "next/server";
import {
  getAnalyzeSiteConfig,
  getAnalyzeSessionCookieName,
} from "../../../../lib/siteConfig";
import {
  extractPlatformToken,
  getPlatformMessage,
  readPlatformResponse,
  validatePlatformAdmin,
} from "../../../../lib/platformAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const site = getAnalyzeSiteConfig();

  if (site.authMode !== "platform-admin") {
    return NextResponse.json(
      { message: "Bu site yönetici girişi kullanmıyor." },
      { status: 404 },
    );
  }

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ message: "E-posta ve şifre zorunludur." }, { status: 400 });
    }

    const loginResponse = await fetch(`${site.authApiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const loginData = await readPlatformResponse(loginResponse);
    const token = extractPlatformToken(loginData);

    if (!loginResponse.ok || !token) {
      return NextResponse.json(
        {
          message: getPlatformMessage(
            loginData,
            loginResponse.ok
              ? "Yetkilendirme sunucusu erişim anahtarı döndürmedi."
              : "Giriş yapılamadı.",
          ),
        },
        { status: loginResponse.ok ? 502 : loginResponse.status },
      );
    }

    const authorization = await validatePlatformAdmin(site.authApiUrl, token);

    if (authorization.ok === false) {
      return NextResponse.json(
        { message: authorization.message },
        { status: authorization.status },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: getAnalyzeSessionCookieName(site),
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json(
      { message: "Yetkilendirme sunucusuna ulaşılamadı." },
      { status: 503 },
    );
  }
}
