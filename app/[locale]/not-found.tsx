import type { Metadata } from "next";
import NotFoundContent from "@/components/features/NotFoundContent";

export const metadata: Metadata = {
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="container-page">
      <NotFoundContent />
    </div>
  );
}
