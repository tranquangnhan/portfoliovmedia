import { PortfolioItem, ContactInfo } from './types';

// Placeholder data simulating a videographer's portfolio
// Using nature videos and high-quality placeholders
export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: '1',
    type: 'video',
    title: 'Cinematic Travel: Vietnam',
    client: 'Featured Project',
    // Using the direct clean URL
    url: 'https://www.youtube.com/watch?v=h6s2S4p4Rxk&t=23s', 
    thumbnail: 'https://i3.ytimg.com/vi/h6s2S4p4Rxk/maxresdefault.jpg',
    description: 'A cinematic journey capturing raw emotions and beautiful moments.',
  },
  {
    id: '2',
    type: 'video',
    title: 'Urban Rhythm',
    client: 'City Beats',
    url: 'https://www.youtube.com/embed/ysz5S6P_z-U',
    thumbnail: 'https://picsum.photos/id/1033/800/450',
    description: 'Capturing the soul of the city in motion.',
  },
  {
    id: '3',
    type: 'image',
    title: 'Fashion Editorial: Gold',
    client: 'Vogue Replica',
    url: 'https://picsum.photos/id/1027/1920/1080',
    thumbnail: 'https://picsum.photos/id/1027/800/450',
    description: 'High contrast studio photography.',
  },
  {
    id: '4',
    type: 'video',
    title: 'Wedding Highlights: Minh & Lan',
    client: 'Private Client',
    url: 'https://www.youtube.com/embed/6rQxo_QhQzQ', // Wedding vibes placeholder
    thumbnail: 'https://picsum.photos/id/1059/800/450',
    description: 'Emotional moments captured in real-time.',
  },
  {
    id: '5',
    type: 'image',
    title: 'Product Launch: ZenWatch',
    client: 'Tech Corp',
    url: 'https://picsum.photos/id/201/1920/1080',
    thumbnail: 'https://picsum.photos/id/201/800/450',
    description: 'Minimalist product photography.',
  },
  {
    id: '6',
    type: 'video',
    title: 'Music Video: Night Lights',
    client: 'Indie Artist',
    url: 'https://www.youtube.com/embed/J2X5mJ3HDYE',
    thumbnail: 'https://picsum.photos/id/1041/800/450',
    description: 'Neon-soaked visuals for the latest hit single.',
  },
];

export const CONTACT_INFO: ContactInfo = {
  bio: '"Chuyên ghi lại những cảm xúc chân thật nhất và lưu giữ chúng thành một di sản hình ảnh bền vững."',
  email: 'contact@luxestudio.com',
  phone: '090 123 4567',
  instagram: '@luxe.film',
  facebook: 'https://facebook.com',
  zalo: '090 123 4567',
  address: 'TP. Hồ Chí Minh, Việt Nam'
};