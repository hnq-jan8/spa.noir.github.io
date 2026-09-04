import Skeleton, { SkeletonText } from "@/components/ui/Skeleton";

/**
 * Placeholder cho từng khối của HomeContent, mỗi khối đi chung một <Reveal>
 * với khối thật nó thay thế (xem Reveal.tsx).
 *
 * Vì đi chung chỗ, hộp placeholder phải khớp hộp thật tới từng px — cùng
 * padding, cùng line box. Lệch chiều cao là lúc bàn giao trang co lại và
 * người đang cuộn dở bị kéo giật lên.
 */

/** Pill "thông tin tính đến": mượn nguyên khung của bản thật. */
export function AsOfPillSkeleton() {
  return (
    <div className="relative flex items-center gap-2 border border-gray-200 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md">
      <Skeleton className="w-1.5 aspect-square rounded-full flex-shrink-0" />
      <div className="flex items-center min-h-[24px]">
        <Skeleton className="h-3 w-56 max-w-full" />
      </div>
    </div>
  );
}

/** Nhãn phân mục. `h-4` là line box của text-xs, bar 12px đặt giữa hộp đó. */
export function SectionLabelSkeleton({ width }: { width: string }) {
  return (
    <div className="h-4 mb-2 mt-6 pl-1.5 flex items-center">
      <Skeleton className={`h-3 ${width}`} />
    </div>
  );
}

/** Thẻ cập nhật chính thức — vạch trái nhạt bớt nhưng vẫn nhận ra thẻ ngay. */
export function LatestUpdateSkeleton() {
  return (
    <div className="bg-white border-l-4 border-l-gray-900/30 rounded-2xl pt-5 pb-4 px-6 card-shadow">
      {/* Từng khối lấy đúng line box của chữ nó thay: nhãn text-xs = 16,
          tiêu đề text-lg = 28, mỗi dòng excerpt text-sm = 20, hàng cuối
          text-xs = 16. Đặt bar mảnh vào giữa hộp đó, chứ không để bar tự
          quyết chiều cao — lệch vài px mỗi khối là trang placeholder ngắn
          hơn trang thật, và người đang cuộn dở bị kéo giật lên lúc bàn giao. */}
      <SkeletonText box="h-4 mb-3" bar="h-3.5 w-32" />
      <SkeletonText box="h-7 mb-2" bar="h-5 w-11/12" />
      {/* Excerpt: 3 dòng dưới md, 2 dòng từ md trở lên — đúng cách câu tóm
          tắt ngắt dòng ở mỗi khổ màn hình. */}
      <div className="mb-2">
        <SkeletonText box="h-5" bar="h-3.5 w-full" />
        <SkeletonText box="h-5" bar="h-3.5 w-full md:w-2/3" />
        <SkeletonText box="h-5 md:hidden" bar="h-3.5 w-2/3" />
      </div>
      <div className="flex items-center justify-between mt-5 h-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

/** Hotline + dải lưu ý báo chí: thiếu dải đó là placeholder hụt ~90px. */
export function HotlinesSkeleton({ hasNotice }: { hasNotice: boolean }) {
  return (
    <>
      <div className="relative z-[2] bg-surface rounded-2xl p-6 card-shadow border border-gray-200">
        <div className="grid grid-cols-1 min-[550px]:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <SkeletonText
                box="h-4 mb-1"
                bar="h-3 w-20"
                fill="skeleton-on-surface"
              />
              <SkeletonText
                box="h-6"
                bar="h-4 w-32"
                fill="skeleton-on-surface"
              />
            </div>
          ))}
        </div>
      </div>
      {hasNotice && (
        <div className="relative z-[1] -mt-3.5 rounded-b-2xl bg-gray-200 px-6 pt-5 pb-2.5 flex gap-2.5 items-center">
          <Skeleton className="w-4 h-4 flex-shrink-0 rounded-full skeleton-on-surface" />
          {/* text-xs + leading-relaxed = 19.5px/dòng. Dưới md câu lưu ý
              xuống 3 dòng, từ md trở lên vừa đúng một dòng — placeholder
              theo đúng cách chữ thật ngắt dòng ở mỗi khổ màn hình. */}
          <div className="flex-1 min-w-0 mt-[4px]">
            <SkeletonText
              box="h-[19.5px]"
              bar="h-3 w-full"
              fill="skeleton-on-surface"
            />
            <SkeletonText
              box="h-[19.5px] md:hidden"
              bar="h-3 w-full"
              fill="skeleton-on-surface"
            />
            <SkeletonText
              box="h-[19.5px] md:hidden"
              bar="h-3 w-2/3"
              fill="skeleton-on-surface"
            />
          </div>
        </div>
      )}
    </>
  );
}

/** Một dòng của danh sách gộp (< 800px). `twoLineDesc`: mô tả dài nhất
 * trong ba mục, ở màn hẹp nó xuống hai dòng. */
export function BrowseRowSkeleton({
  twoLineDesc = false,
}: {
  twoLineDesc?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 sm:px-6">
      <Skeleton className="skeleton-on-card w-5 h-5 flex-shrink-0 mr-1 sm:mr-2" />
      <div className="flex-1 min-w-0">
        <SkeletonText box="h-6" bar="h-4 w-2/5" fill="skeleton-on-card" />
        <SkeletonText box="h-5" bar="h-3.5 w-3/4" fill="skeleton-on-card" />
        {twoLineDesc && (
          <SkeletonText
            box="h-5 sm:hidden"
            bar="h-3.5 w-1/3"
            fill="skeleton-on-card"
          />
        )}
      </div>
      <Skeleton className="skeleton-on-card w-5 h-5 flex-shrink-0" />
    </div>
  );
}

/** Một ô của lưới 2 cột (từ 800px trở lên). */
export function BrowseCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl pt-6 pb-4 px-6 card-shadow">
      <Skeleton className="skeleton-on-card w-6 h-6 mb-3" />
      <SkeletonText box="h-7" bar="h-5 w-2/5" fill="skeleton-on-card" />
      <SkeletonText box="h-5" bar="h-3.5 w-4/5" fill="skeleton-on-card" />
    </div>
  );
}

/** Thẻ thông cáo báo chí chạy hết chiều ngang (từ 800px trở lên). */
export function BrowseWideCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 card-shadow flex items-center gap-4">
      <Skeleton className="skeleton-on-card w-6 h-6 flex-shrink-0" />
      <div className="flex-1">
        <SkeletonText box="h-7" bar="h-5 w-1/4" fill="skeleton-on-card" />
        <SkeletonText box="h-5" bar="h-3.5 w-1/2" fill="skeleton-on-card" />
      </div>
    </div>
  );
}
