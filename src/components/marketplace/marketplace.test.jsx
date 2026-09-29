// Test khối giao diện v2 marketplace.

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Carousel, CityTile, FeaturedOrganizerCard, PosterCard, RankedEventCard } from ".";

const event = {
  id: "e1",
  slug: "the-lumiere-tour",
  name: "The Lumière Tour",
  startsAt: "2026-10-24T12:00:00Z",
  venue: { city: "Hà Nội" },
  coverImageUrl: "https://images.unsplash.com/photo-1?w=1600",
  priceFrom: 800000,
  status: "PUBLISHED",
};
const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("marketplace", () => {
  it("Carousel: vùng có nhãn, mỗi thẻ một slide, nút trước/sau", () => {
    wrap(
      <Carousel label="Sự kiện đặc biệt">
        <PosterCard event={event} />
        <PosterCard event={{ ...event, id: "e2", slug: "b", name: "B" }} />
      </Carousel>
    );
    expect(screen.getByRole("region", { name: "Sự kiện đặc biệt" })).toBeInTheDocument();
    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Xem mục tiếp theo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /The Lumière Tour/ })).toHaveAttribute("href", "/events/the-lumiere-tour");
  });

  it("Carousel rỗng không render gì", () => {
    const { container } = wrap(<Carousel label="x">{[]}</Carousel>);
    expect(container).toBeEmptyDOMElement();
  });

  it("PosterCard tải ảnh đúng cỡ; RankedEventCard đọc được thứ hạng", () => {
    wrap(<RankedEventCard event={event} rank={1} />);
    expect(screen.getByRole("link")).toHaveTextContent("Hạng 1:");
    expect(screen.getByRole("img").getAttribute("src")).toContain("w=480");
  });

  it("FeaturedOrganizerCard: chữ viết tắt khi không có logo, dấu tích khi verified", () => {
    wrap(<FeaturedOrganizerCard organizer={{ id: "o", slug: "sunrise-live", name: "Sunrise Live", verified: true }} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/organizers/sunrise-live");
    expect(link).toHaveTextContent("SL");
    expect(screen.getByText("Đã xác minh")).toBeInTheDocument();
  });

  it("CityTile: link + tên + số sự kiện", () => {
    wrap(<CityTile name="Hà Nội" href="/events?city=H%C3%A0%20N%E1%BB%99i" count={7} image={{ src: "https://images.unsplash.com/photo-2", alt: "Hồ Gươm" }} />);
    expect(screen.getByRole("link")).toHaveTextContent("Hà Nội7 sự kiện");
    expect(screen.getByRole("img", { name: "Hồ Gươm" })).toBeInTheDocument();
  });
});
