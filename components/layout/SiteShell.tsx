import Navbar from "@/components/layout/Navbar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Footer from "@/components/layout/Footer";
import { getBuildMode } from "@/lib/buildMode";

/**
 * Khung site (header + dải crumb mobile + footer) dùng chung cho layout
 * [locale] và 404 gốc (404.html) — để mọi trang 404 đều có header/footer như
 * nhau, không riêng trang trong [locale].
 */
export default async function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logoOnBlack, logoOnWhite } = await getBuildMode();

  return (
    <div className="flex flex-col min-h-[100dvh] bg-page">
      <Navbar logoOnBlack={logoOnBlack} />
      {/* Dải crumb của trang, chỉ có ở mobile — đứng ngay sau header vì nó
          sticky theo `top-12` của header đó. */}
      <Breadcrumb />
      {/* Navbar's header is `sticky` on mobile (stays in flow, no spacer
          needed) but `fixed` from `md:` up, where it drops out of flow —
          this spacer reserves its md:h-14 there so content below (and
          sticky offsets like `top-12`) sits exactly where it would if the
          header were still in flow. */}
      <div className="hidden md:block md:h-14 flex-shrink-0" aria-hidden="true" />
      {/* flex column so a page can claim leftover height with `flex-1`
          — see PressReleasesContent's article wrapper. */}
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer logoOnWhite={logoOnWhite} />
    </div>
  );
}
