
export type Property = {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  listingType: 'sale' | 'rent';
  location: {
    address: string;
    pincode: string;
    state: string;
    latitude?: number;
    longitude?: number;
  };
  contactNumber: string;
  whatsappNumber: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareYards: number;
  amenities: string[];
  imageUrls: string[];
  isFeatured: boolean;
  dateListed: Date | any;
  listingTier: 'free' | 'premium';
  expiresAt: Date | any;
  furnishing?: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  overlooking?: string;
  ageOfConstruction?: string;
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

export type Order = {
  paymentId: string;
  amount: number;
  date: Date | any;
}

export type User = {
  id: string;
  fullName: string;
  username?: string;
  email: string;
  phone: string;
  category: 'user' | 'listing-property' | 'real-estate-agent' | 'interior-designer' | 'vendor';
  dateJoined: Date | any;
  photoURL?: string;
  wishlist?: string[];
  companyName?: string;
  servicesProvided?: string[];
  bio?: string;
  orders?: Order[];
  listingCredits?: number;
  isVerified?: boolean;
  verifiedUntil?: Date | any;
  isBlocked?: boolean;
}
