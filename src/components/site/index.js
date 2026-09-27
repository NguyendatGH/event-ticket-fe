/**
 * Khối giao diện dùng chung cho nhiều trang. Luôn import qua barrel này:
 *   import { Container, PageHeader, EventCard } from "@/components/site";
 * Component chỉ một trang dùng thì để trong pages/<khu vực>/components/, không đưa vào đây.
 */

// Khung trang
export { Container } from "./Container";
export { Header } from "./Header";
export { CategoryNav } from "./CategoryNav";
export { Footer } from "./Footer";
export { Logo } from "./Logo";
export { PageHeader } from "./PageHeader";
export { SectionHeader } from "./SectionHeader";
export { BackLink } from "./BackLink";

// Sự kiện, vé, người dùng
export { EventCard } from "./EventCard";
export { EventGrid } from "./EventGrid";
export { CategoryTabs } from "./CategoryTabs";
export { Price } from "./Price";
export { StatusBadge } from "./StatusBadge";
export { TicketQR } from "./TicketQR";
export { UserAvatar } from "./UserAvatar";
export { KeyValueList } from "./KeyValueList";
export { ImageWithFallback } from "./ImageWithFallback";
export { ImageUpload } from "./ImageUpload";

// Tìm kiếm
export { SearchInput } from "./SearchInput";
export { DebouncedSearch } from "./DebouncedSearch";

// Thông báo, trạng thái rỗng / lỗi, hộp xác nhận
export { Notice } from "./Notice";
export { Disclosure } from "./Disclosure";
export { EmptyState } from "./EmptyState";
export { ErrorState } from "./ErrorState";
export { ConfirmDialog } from "./ConfirmDialog";

// Đang tải
export { EventGridSkeleton, PageLoader } from "./Skeletons";
export { InfiniteSentinel } from "./InfiniteSentinel";
