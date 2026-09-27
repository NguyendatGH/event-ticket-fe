import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/components/site";
import { imageAt } from "@/lib/image";
import { cn } from "@/lib/utils";

/**
 * Ô "Điểm đến" (design-spec v2): ảnh thành phố bo 12px, dải gradient xanh từ đáy, tên thành phố to đậm trắng.
 * Truyền `images` (2-4 ảnh) thay cho `image` để làm ô ghép lưới 2×2 ("Vị trí khác").
 *
 *   <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
 *     <CityTile name="Hà Nội" image={{ src: "https://images.unsplash.com/…", alt: "Văn Miếu, Hà Nội" }} href="/events?city=Hà Nội" count={12} />
 *     <CityTile name="Vị trí khác" images={[{ src, alt }, …]} href="/events" />
 *   </div>
 *
 * Props: name, href, image {src, alt} | images [{src, alt}], count (số sự kiện, tùy chọn), priority, className.
 * Ảnh ghép: alt rỗng (trang trí), tên ô đã nói đủ.
 */
export function CityTile({ name, href, image, images, count, priority = false, className }) {
  const mosaic = images?.length > 1;
  return (
    <Link
      to={href}
      className={cn(
        "group relative block aspect-tile overflow-hidden rounded-card bg-surface ring-1 ring-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
        className
      )}
    >
      {mosaic ? (
        <span className="grid size-full grid-cols-2 grid-rows-2">
          {images.slice(0, 4).map((img, i) => (
            <ImageWithFallback key={img.src ?? i} src={imageAt(img.src, 400)} alt="" priority={priority} className="size-full group-hover:scale-105 motion-reduce:group-hover:scale-100" />
          ))}
        </span>
      ) : (
        <ImageWithFallback
          src={imageAt(image?.src, 720)}
          alt={image?.alt ?? ""}
          fallbackLabel={name}
          priority={priority}
          className="size-full group-hover:scale-105 motion-reduce:group-hover:scale-100"
        />
      )}
      {/* Gradient xanh từ đáy (màu mẫu từ tham chiếu, cùng họ #2DC275) để chữ trắng đọc được trên mọi ảnh. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#1b7a38] via-[#2a9d4a]/55 via-45% to-transparent to-75%"
      />
      <span className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <span className="block text-xl leading-tight font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] sm:text-2xl lg:text-3xl">{name}</span>
        {count != null ? <span className="mt-1 block text-sm font-semibold text-white">{count} sự kiện</span> : null}
      </span>
    </Link>
  );
}
