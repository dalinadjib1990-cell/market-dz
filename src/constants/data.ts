export const WILAYAS = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار", "البليدة", "البويرة",
  "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر", "الجلفة", "جيجل", "سطيف", "سعيدة",
  "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة",
  "وهران", "البيض", "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة",
  "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية", "غليزان",
  "تيميمون", "برج باجي مختار", "أولاد جلال", "بني عباس", "عين صالح", "عين قزام", "تقرت", "جانت", "المغير", "المنيعة"
];

export const BRANDS = [
  "Renault", "Hyundai", "Volkswagen", "Peugeot", "Dacia", "Toyota", "Kia", "Seat", "Suzuki", "Chevrolet",
  "Ford", "Fiat", "Nissan", "Mercedes-Benz", "BMW", "Audi", "Skoda", "Citroen", "Chery", "Geely", "MG", "Changan", "Other"
];

export const MODELS: Record<string, string[]> = {
  "Renault": ["Clio 1", "Clio 2", "Clio 3", "Clio 4", "Symbol", "Megane", "Kangoo", "Master"],
  "Volkswagen": ["Golf 1", "Golf 2", "Golf 3", "Golf 4", "Golf 5", "Golf 6", "Golf 7", "Golf 8", "Polo", "Passat", "Caddy"],
  "Peugeot": ["206", "207", "208", "301", "307", "308", "406", "508", "Partner"],
  "Hyundai": ["Accent", "Atos", "i10", "i20", "i30", "Tucson", "Santa Fe"],
  "Dacia": ["Logan", "Sandero", "Stepway", "Duster"],
};

export const FUEL_TYPES = ['بنزين', 'ديزل', 'غاز', 'كهرباء'] as const;

export const CONDITIONS = ['ممتازة', 'جيدة', 'متوسطة', 'تحت الوسط'] as const;

export const REPAIR_OPTIONS = [
  "معاودة فوال",
  "فيها راكور",
  "خبشات خفاف",
  "بروتال",
  "معاودة رونجرو",
  "كايو",
  "معاودة على نظافة",
  "باب محطوط",
  "لال محطوط",
  "موتور معاود"
];

export const ENGINES = ["1.1", "1.2", "1.4", "1.5", "1.6", "1.9", "2.0", "HDI", "DCI", "TDI"];

export const GEARBOXES = ["يدوي (Manuelle)", "أوتوماتيكي (Automatique)"];

export const YEARS = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => (2026 - i).toString());

export const AD_TEMPLATES = [
  { id: 'commercial', name: 'تجاري', class: 'border-brand-green shadow-brand-green/20' },
  { id: 'attractive', name: 'جذاب', class: 'border-brand-red shadow-brand-red/20' },
  { id: 'special', name: 'مميز', class: 'border-amber-500 shadow-amber-500/20' },
  { id: 'practical', name: 'عملي', class: 'border-blue-500 shadow-blue-500/20' }
];
