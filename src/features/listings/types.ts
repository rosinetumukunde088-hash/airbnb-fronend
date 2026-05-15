export type category = 'beach' | 'mountain' | 'city' | 'countryside' | 'apartment' | 'house' | 'villa' | 'cabin';

export interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  superhost: boolean;
  available: boolean;
  availableFrom: string;
  img: string;
  category: category;
}
