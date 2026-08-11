import { redirect } from "next/navigation";
import { getAnalyzeSiteConfig } from "../../lib/siteConfig";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const site = getAnalyzeSiteConfig();
  if (site.authMode === "none") redirect("/");

  return (
    <LoginClient
      title={site.dashboardTitle.tr}
      description={`${site.name} için özel trafik ve kullanım paneli`}
    />
  );
}
