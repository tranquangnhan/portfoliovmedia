import type { PortfolioItem, ContactInfo } from './types';

export const INITIAL_DATABASE: {
  portfolioItems: PortfolioItem[];
  contactInfo: ContactInfo;
} = {
  "portfolioItems": [
    {
      "id": "1",
      "type": "video",
      "title": "Cinematic Travel: Vietnam",
      "client": "Featured Project",
      "url": "https://www.youtube.com/watch?v=h6s2S4p4Rxk",
      "thumbnail": "https://i3.ytimg.com/vi/h6s2S4p4Rxk/maxresdefault.jpg",
      "description": "Hành trình khám phá vẻ đẹp Việt Nam qua những thước phim đậm chất điện ảnh."
    },
    {
      "id": "2",
      "type": "video",
      "title": "Urban Rhythm",
      "client": "City Beats",
      "url": "https://www.youtube.com/embed/ysz5S6P_z-U",
      "thumbnail": "https://picsum.photos/id/1033/800/450",
      "description": "Nhịp sống đô thị sôi động qua lăng kính nghệ thuật."
    },
    {
      "id": "3",
      "type": "image",
      "title": "Fashion Editorial: Gold",
      "client": "Vogue Replica",
      "url": "https://picsum.photos/id/1027/1920/1080",
      "thumbnail": "https://picsum.photos/id/1027/800/450",
      "description": "Bộ ảnh thời trang studio với độ tương phản cao."
    },
    {
      "id": "4",
      "type": "video",
      "title": "Wedding Highlights: Minh & Lan",
      "client": "Private Client",
      "url": "https://www.youtube.com/embed/6rQxo_QhQzQ",
      "thumbnail": "https://picsum.photos/id/1059/800/450",
      "description": "Khoảnh khắc hạnh phúc được lưu giữ trọn vẹn."
    },
    {
      "id": "5",
      "type": "image",
      "title": "Product Launch: ZenWatch",
      "client": "Tech Corp",
      "url": "https://picsum.photos/id/201/1920/1080",
      "thumbnail": "https://picsum.photos/id/201/800/450",
      "description": "Chụp ảnh sản phẩm phong cách tối giản."
    },
    {
      "id": "6",
      "type": "video",
      "title": "Music Video: Night Lights",
      "client": "Indie Artist",
      "url": "https://www.youtube.com/embed/J2X5mJ3HDYE",
      "thumbnail": "https://picsum.photos/id/1041/800/450",
      "description": "MV ca nhạc với ánh sáng Neon huyền ảo."
    }
  ],
  "contactInfo": {
    "bio": "VMEDIA Team - Chuyên sản xuất hình ảnh, video kỷ yếu, MV ca nhạc và TVC quảng cáo chuyên nghiệp. Chúng tôi kể câu chuyện của bạn bằng ngôn ngữ điện ảnh.",
    "email": "contact@vmedia.vn",
    "phone": "090 123 4567",
    "instagram": "@vmedia.team",
    "facebook": "https://www.facebook.com/vmediateam",
    "zalo": "090 123 4567",
    "address": "Hà Nội & TP. Hồ Chí Minh",
    "seoTitle": "VMEDIA - Production House & Creative Studio",
    "seoDescription": "VMEDIA Team chuyên quay phim, chụp ảnh kỷ yếu, sản xuất MV, TVC quảng cáo với phong cách điện ảnh, sáng tạo và chuyên nghiệp hàng đầu Việt Nam.",
    "seoKeywords": "vmedia, quay phim, chụp ảnh, kỷ yếu, mv, tvc, production house, quay phim sự kiện"
  }
};