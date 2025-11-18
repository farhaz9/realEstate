export type Property = {
  id: string;
  title: string;
  type: 'Apartment' | 'Villa' | 'Penthouse' | 'Farmhouse';
  location: string;
  price: number; // in Crores
  beds: number;
  baths: number;
  area: number; // in sqft
  image: string;
  description: string;
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
