export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  wilaya: string;
  phone: string;
  photoURL?: string;
  rating?: number;
  isVerified?: boolean;
  createdAt: any;
}

export interface Ad {
  id: string;
  userId: string;
  sellerName: string;
  sellerPhone: string;
  title: string;
  description: string;
  price: number;
  isNegotiable: boolean;
  brand: string;
  model: string;
  year: number;
  fuelType: 'بنزين' | 'بنزين + غاز' | 'ديزل' | 'كهرباء';
  mileage?: number;
  condition: 'جيدة' | 'متوسطة' | 'أقل من متوسطة';
  repairs: string[];
  images: string[];
  wilaya: string;
  isVerified?: boolean;
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
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export interface Chat {
  id: string;
  participants: string[];
  adId: string;
  lastMessage?: string;
  updatedAt: any;
}
