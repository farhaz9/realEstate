import { Timestamp } from "firebase/firestore";

export type Property = {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  listingType: 'sale' | 'rent';
  location: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  amenities: string[];
  imageUrls: string[];
  isFeatured: boolean;
  dateListed: Timestamp;
};

export type Builder = {
  id: string;
  name: string;
  logo: string;
  description: string;
};

export type InteriorProject = {
  id: string;
  title: string;
  description: string;
  images: string[];
};
