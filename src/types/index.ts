export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  wilaya: string;
  phone: string;
  photoURL?: string;
  role?: 'user' | 'admin';
  rating?: number;
  isVerified?: boolean;
  showPhone?: boolean;
  createdAt: any;
}

export interface Ad {
  id: string;
  userId: string;
  sellerName: string;
  sellerPhone: string;
  sellerEmail?: string;
  showPhone: boolean;
  title: string;
  description: string;
  price: number;
  samouni?: number;
  isNegotiable: boolean;
  brand: string;
  model: string;
  year: number;
  fuelType: 'بنزين' | 'ديزل' | 'غاز' | 'كهرباء';
  mileage?: number;
  engine?: string;
  gearbox?: string;
  condition: 'ممتازة' | 'جيدة' | 'متوسطة' | 'تحت الوسط';
  salonCondition?: 'جيدة' | 'متوسطة' | 'تحت الوسط';
  suspensionRating?: number;
  tiresRating?: number;
  engineRating?: number;
  bodyRating?: number;
  interiorRating?: number;
  oilConsumption: boolean;
  oilConsumptionPercentage?: number;
  overheats: boolean;
  repairs: string[];
  images: string[];
  wilaya: string;
  isVerified?: boolean;
  template?: string;
  status: 'active' | 'sold';
  createdAt: any;
  views: number;
}

export interface Comment {
  id: string;
  adId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
  edited?: boolean;
  deleted?: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
  read?: boolean;
  imageUrl?: string | null;
  edited?: boolean;
  deleted?: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  adId: string;
  adTitle?: string;
  adPrice?: number;
  adSamouni?: number;
  adWilaya?: string;
  buyerId?: string;
  sellerId?: string;
  buyerName?: string;
  sellerName?: string;
  buyerEmail?: string;
  sellerEmail?: string;
  lastMessage?: string;
  lastSenderId?: string;
  updatedAt: any;
  unreadCount?: Record<string, number>;
}
