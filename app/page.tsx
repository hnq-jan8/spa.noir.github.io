import LocaleRedirect from "@/components/sys/LocaleRedirect";
import RedirectToOfficial from "@/components/sys/RedirectToOfficial";
import { getBuildMode } from "@/lib/buildMode";

export default async function RootPage() {
  const { active, officialSiteUrl } = await getBuildMode();
  if (!active) return <RedirectToOfficial url={officialSiteUrl} />;
  return <LocaleRedirect />;
}
