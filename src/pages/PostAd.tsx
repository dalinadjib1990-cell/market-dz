import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { uploadToCloudinary } from '../lib/cloudinary';
import { BRANDS, WILAYAS, FUEL_TYPES, CONDITIONS, REPAIR_OPTIONS } from '../constants/data';
import { Camera, X, Loader2, CheckCircle2, AlertCircle, PlusSquare } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function PostAd() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    isNegotiable: false,
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    fuelType: 'بنزين',
    mileage: '',
    condition: 'جيدة',
    repairs: [] as string[],
    wilaya: profile?.wilaya || 'الجزائر',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 10) {
      toast.error('يمكنك رفع حتى 10 صور فقط');
      return;
    }

    setUploading(true);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadToCloudinary(files[i]);
        newImages.push(url);
      } catch (error) {
        toast.error(`فشل رفع الصورة ${i + 1}`);
      }
    }

    setImages([...images, ...newImages]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleRepair = (repair: string) => {
    setFormData(prev => ({
      ...prev,
      repairs: prev.repairs.includes(repair)
        ? prev.repairs.filter(r => r !== repair)
        : [...prev.repairs, repair]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    if (images.length === 0) {
      toast.error('يرجى إضافة صورة واحدة على الأقل');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'ads'), {
        ...formData,
        userId: user.uid,
        sellerName: `${profile?.firstName} ${profile?.lastName}`,
        sellerPhone: profile?.phone || '',
        price: Number(formData.price),
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        images,
        status: 'active',
        views: 0,
        createdAt: serverTimestamp(),
      });

      toast.success('تم نشر إعلانك بنجاح!');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء نشر الإعلان');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 glass-card text-center space-y-6">
        <AlertCircle size={48} className="mx-auto text-brand-red" />
        <h2 className="text-2xl font-bold">يجب تسجيل الدخول</h2>
        <p className="text-white/40">يرجى تسجيل الدخول لتتمكن من إضافة إعلان جديد.</p>
        <button onClick={() => navigate('/login')} className="btn-primary w-full">تسجيل الدخول</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter">أضف إعلان جديد</h1>
        <p className="text-white/40">أدخل تفاصيل سيارتك بدقة لجذب المشترين</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Image Upload Section */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Camera size={20} className="text-brand-green" />
            صور السيارة (حتى 10 صور)
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group">
                <img src={url} alt="Car" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-brand-red text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {images.length < 10 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-brand-green/50 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2">
                {uploading ? (
                  <Loader2 className="animate-spin text-brand-green" size={32} />
                ) : (
                  <>
                    <PlusSquare size={32} className="text-white/20" />
                    <span className="text-xs text-white/40 font-bold">رفع صور</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </section>

        {/* Basic Info */}
        <section className="glass-card p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">عنوان الإعلان</label>
              <input
                required
                type="text"
                placeholder="مثال: Renault Symbol 2018 نقية"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">السعر (دج)</label>
              <div className="relative">
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field pl-12"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-bold">دج</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={formData.isNegotiable}
                  onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                  className="w-4 h-4 accent-brand-green"
                />
                <span className="text-sm text-white/60">السعر قابل للتفاوض (سموني)</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">وصف السيارة</label>
            <textarea
              required
              rows={4}
              placeholder="اكتب تفاصيل السيارة، المحرك، الحالة..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none"
            ></textarea>
          </div>
        </section>

        {/* Technical Details */}
        <section className="glass-card p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">الماركة</label>
              <select
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="input-field appearance-none"
              >
                <option value="">اختر الماركة</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">الموديل</label>
              <input
                required
                type="text"
                placeholder="مثال: Golf 7"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">سنة الصنع</label>
              <input
                required
                type="number"
                min="1980"
                max={new Date().getFullYear()}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">نوع الطاقة</label>
              <select
                required
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
                className="input-field appearance-none"
              >
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">المسافة المقطوعة (كم)</label>
              <input
                type="number"
                placeholder="0"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">الحالة</label>
              <select
                required
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                className="input-field appearance-none"
              >
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Repairs Section */}
        <section className="glass-card p-8 space-y-6">
          <h3 className="text-xl font-bold">العوادات (Réparations)</h3>
          <div className="flex flex-wrap gap-3">
            {REPAIR_OPTIONS.map(repair => (
              <button
                key={repair}
                type="button"
                onClick={() => toggleRepair(repair)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                  formData.repairs.includes(repair)
                    ? "bg-brand-green/20 border-brand-green text-brand-green"
                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                )}
              >
                {repair}
              </button>
            ))}
          </div>
        </section>

        {/* Location */}
        <section className="glass-card p-8 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">الولاية</label>
            <select
              required
              value={formData.wilaya}
              onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
              className="input-field appearance-none"
            >
              {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </section>

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full btn-primary !py-5 text-xl flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              جاري النشر...
            </>
          ) : (
            <>
              <CheckCircle2 size={24} />
              نشر الإعلان الآن
            </>
          )}
        </button>
      </form>
    </div>
  );
}
