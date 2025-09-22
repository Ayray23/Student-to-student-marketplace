"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function BannerCarousel() {
  const banners = ["/banner1.jpg", "/banner2.jpg", "/banner3.jpg"];

  return (
    <Swiper autoplay={{ delay: 3000 }} loop>
      {banners.map((img, i) => (
        <SwiperSlide key={i}>
          <img src={img} className="w-full h-56 object-cover rounded-lg" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
