import Image from "next/image";

interface ArticleContentProps {
  title: string;
  body: string[];
  imageSrc?: string;
  imageAlt?: string;
}

export default function ArticleContent({
  title,
  body,
  imageSrc,
  imageAlt = "Article image",
}: ArticleContentProps) {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        {/* Text content */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">{title}</h1>
          <hr className="border-gray-400 mb-6" />
          <div className="space-y-4">
            {body.map((paragraph, idx) => (
              <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Image — shows above text on mobile, beside on desktop */}
        {imageSrc && (
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="relative w-full aspect-[16/9] lg:aspect-[4/3] rounded overflow-hidden bg-gray-100">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover grayscale"
                unoptimized
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
