
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
  dateListed: Date | any; // Changed to allow Date object
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

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  category: 'listing-property' | 'real-estate-agent' | 'interior-designer';
  dateJoined: Date | any;
  photoURL?: string;
}
