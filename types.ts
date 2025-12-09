export type MediaType = 'video' | 'image';

export interface PortfolioItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnail: string;
  title: string;
  description?: string;
  client?: string;
}

export interface ContactInfo {
  bio: string;
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  zalo: string;
  address: string;
  // SEO Fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export type ViewState = 'HOME' | 'PORTFOLIO' | 'ABOUT' | 'CONTACT' | 'ADMIN';