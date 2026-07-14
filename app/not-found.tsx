import type { Metadata } from "next";
import NotFoundContent from "@/components/features/NotFoundContent";

export const metadata: Metadata = {
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <NotFoundContent />
    </div>
  );
}
