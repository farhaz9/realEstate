

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
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  viewCount?: number;
  wishlistCount?: number;
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

export type Transaction = {
  paymentId: string;
  amount: number;
  date: Date | any;
  description?: string;
}

export type Review = {
  id: string;
  professionalId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerPhotoURL?: string;
  rating: number;
  comment?: string;
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
  transactions?: Transaction[];
  listingCredits?: number;
  isVerified?: boolean;
  verifiedUntil?: Date | any;
  isBlocked?: boolean;
  isFeatured?: boolean;
  rank?: number;
}

export type AppSettings = {
    id: string;
    listingPrice: number;
    verifiedPriceMonthly: number;
    verifiedPriceAnnually: number;
    listingValidityDays: number;
    announcement?: {
        text: string;
        url?: string;
        enabled: boolean;
    };
    notification?: {
        text: string;
        audience: 'all' | 'verified';
        timestamp: string;
        duration?: number;
    }
};

export type Lead = {
    id: string;
    propertyId: string;
    propertyTitle: string;
    agentId: string;
    agentName: string;
    inquiringUserId: string;
    inquiringUserName: string;
    inquiringUserEmail: string;
    inquiringUserPhone: string;
    leadDate: Date | any;
    contactMethod: 'call' | 'whatsapp' | 'email';
}

export type NotificationMessage = {
    id: string;
    audience: 'all' | 'verified';
    message: string;
    timestamp: Date | any;
}
