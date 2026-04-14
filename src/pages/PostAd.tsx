import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { uploadToCloudinary } from '../lib/cloudinary';
import { BRANDS, MODELS, WILAYAS, FUEL_TYPES, CONDITIONS, REPAIR_OPTIONS, ENGINES, GEARBOXES, AD_TEMPLATES, YEARS } from '../constants/data';
import { Camera, X, Loader2, CheckCircle2, AlertCircle, PlusSquare, Info, ShieldCheck, Zap, Star } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function PostAd() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    samouni: '',
    isNegotiable: false,
    brand: '',
    customBrand: '',
    model: '',
    customModel: '',
    year: new Date().getFullYear(),
    fuelType: 'بنزين',
    mileage: '',
    engine: '',
    customEngine: '',
    gearbox: 'يدوي (Manuelle)',
    customGearbox: '',
    condition: 'جيدة',
    interiorRating: 10,
    suspensionRating: 10,
    tiresRating: 10,
    engineRating: 10,
    bodyRating: 10,
    repairs: [] as string[],
    wilaya: profile?.wilaya || 'الجزائر',
    showPhone: true,
    template: 'practical',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 10) {
      toast.error('يمكنك رفع حتى 10 صور فقط');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadToCloudinary(files[i], (p) => {
          setUploadProgress(Math.round(((i + p / 100) / files.length) * 100));
        });
        newImages.push(url);
      } catch (error) {
        toast.error(`فشل رفع الصورة ${i + 1}`);
      }
    }

    setImages([...images, ...newImages]);
    setUploading(false);
    setUploadProgress(0);
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
      const finalBrand = formData.brand === 'Other' ? formData.customBrand : formData.brand;
      const finalModel = formData.model === 'Other' ? formData.customModel : formData.model;
      const finalEngine = formData.engine === 'Other' ? formData.customEngine : formData.engine;
      const finalGearbox = formData.gearbox === 'Other' ? formData.customGearbox : formData.gearbox;

      const sellerName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : '';
      const finalSellerName = sellerName || user.displayName || user.email?.split('@')[0] || 'بائع';

      await addDoc(collection(db, 'ads'), {
        ...formData,
        brand: finalBrand,
        model: finalModel,
        engine: finalEngine,
        gearbox: finalGearbox,
        suspensionRating: Number(formData.suspensionRating),
        tiresRating: Number(formData.tiresRating),
        engineRating: Number(formData.engineRating),
        bodyRating: Number(formData.bodyRating),
        interiorRating: Number(formData.interiorRating),
        userId: user.uid,
        sellerName: finalSellerName,
        sellerEmail: user.email,
        sellerPhone: profile?.phone || user.phoneNumber || '',
        price: Number(formData.price),
        samouni: formData.samouni ? Number(formData.samouni) : null,
        year: Number(formData.year),
        mileage: formData.mileage ? Number(formData.mileage) : null,
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
      <div className="text-center mb-12 space-y-4">
        <h2 className="shiny-text text-3xl md:text-5xl">بسم الله الرحمن الرحيم</h2>
        <div className="relative inline-block">
          <h3 className="text-xl md:text-2xl font-bold text-brand-green/80 italic">
            اللهم صلي و سلم على سيدنا محمد
          </h3>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-100%] animate-shimmer"></div>
        </div>
        <h1 className="text-4xl font-black tracking-tighter mt-4">أضف إعلان جديد</h1>
        <p className="text-white/40">أدخل تفاصيل سيارتك بدقة لجذب المشترين</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Template Selection */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Zap size={20} className="text-brand-green" />
            اختر قالب الإعلان
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {AD_TEMPLATES.map(template => (
              <button
                key={template.id}
                type="button"
                onClick={() => setFormData({ ...formData, template: template.id })}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all text-center space-y-2",
                  formData.template === template.id 
                    ? template.class + " bg-white/5" 
                    : "border-white/10 opacity-50 hover:opacity-100"
                )}
              >
                <div className={cn("w-3 h-3 rounded-full mx-auto", template.id === 'commercial' ? 'bg-brand-green' : template.id === 'attractive' ? 'bg-brand-red' : template.id === 'special' ? 'bg-amber-500' : 'bg-blue-500')}></div>
                <span className="text-sm font-bold">{template.name}</span>
              </button>
            ))}
          </div>
        </section>

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
              <label className="relative aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-brand-green/50 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden">
                {uploading ? (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 p-4">
                    <Loader2 className="animate-spin text-brand-green" size={24} />
                    <span className="text-[10px] font-bold text-white">{uploadProgress}%</span>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-green transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    required
                    type="number"
                    placeholder="السعر"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field pl-12"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-bold text-xs">دج</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="ساموني"
                    value={formData.samouni}
                    onChange={(e) => setFormData({ ...formData, samouni: e.target.value })}
                    className="input-field pl-12"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-bold text-xs">ساموني</span>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={formData.isNegotiable}
                  onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                  className="w-4 h-4 accent-brand-green"
                />
                <span className="text-sm text-white/60">السعر قابل للتفاوض</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">وصف السيارة (اختياري)</label>
            <textarea
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
            {/* Brand */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">الماركة (اختياري)</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
                className="input-field appearance-none"
              >
                <option value="">اختر الماركة</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                <option value="Other">أخرى (إدخال يدوي)</option>
              </select>
              {formData.brand === 'Other' && (
                <input
                  type="text"
                  placeholder="ادخل الماركة يدوياً"
                  value={formData.customBrand}
                  onChange={(e) => setFormData({ ...formData, customBrand: e.target.value })}
                  className="input-field mt-2"
                />
              )}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">الموديل</label>
              <select
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="input-field appearance-none"
              >
                <option value="">اختر الموديل</option>
                {MODELS[formData.brand]?.map(m => <option key={m} value={m}>{m}</option>)}
                <option value="Other">أخرى (إدخال يدوي)</option>
              </select>
              {(formData.model === 'Other' || !MODELS[formData.brand]) && (
                <input
                  required
                  type="text"
                  placeholder="ادخل الموديل يدوياً"
                  value={formData.customModel}
                  onChange={(e) => setFormData({ ...formData, customModel: e.target.value })}
                  className="input-field mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">سنة الصنع (اختياري)</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="input-field appearance-none"
              >
                <option value="">اختر السنة</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">نوع الطاقة (اختياري)</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
                className="input-field appearance-none"
              >
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">المسافة المقطوعة (كم) - اختياري</label>
              <input
                type="number"
                placeholder="0"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">الحالة العامة (اختياري)</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                className="input-field appearance-none"
              >
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">حالة الصالون ({formData.interiorRating}/10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.interiorRating}
                onChange={(e) => setFormData({ ...formData, interiorRating: Number(e.target.value) })}
                className="w-full accent-brand-green mt-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">حالة جهاز التعليق ({formData.suspensionRating}/10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.suspensionRating}
                onChange={(e) => setFormData({ ...formData, suspensionRating: Number(e.target.value) })}
                className="w-full accent-brand-green mt-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">حالة العجلات ({formData.tiresRating}/10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.tiresRating}
                onChange={(e) => setFormData({ ...formData, tiresRating: Number(e.target.value) })}
                className="w-full accent-brand-green mt-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">حالة المحرك ({formData.engineRating}/10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.engineRating}
                onChange={(e) => setFormData({ ...formData, engineRating: Number(e.target.value) })}
                className="w-full accent-brand-green mt-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">حالة الهيكل ({formData.bodyRating}/10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.bodyRating}
                onChange={(e) => setFormData({ ...formData, bodyRating: Number(e.target.value) })}
                className="w-full accent-brand-green mt-2"
              />
            </div>

            {/* Engine */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">نوع المحرك</label>
              <select
                value={formData.engine}
                onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                className="input-field appearance-none"
              >
                <option value="">اختر المحرك</option>
                {ENGINES.map(e => <option key={e} value={e}>{e}</option>)}
                <option value="Other">أخرى (إدخال يدوي)</option>
              </select>
              {formData.engine === 'Other' && (
                <input
                  type="text"
                  placeholder="ادخل المحرك يدوياً"
                  value={formData.customEngine}
                  onChange={(e) => setFormData({ ...formData, customEngine: e.target.value })}
                  className="input-field mt-2"
                />
              )}
            </div>

            {/* Gearbox */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">نوع العلبة</label>
              <select
                value={formData.gearbox}
                onChange={(e) => setFormData({ ...formData, gearbox: e.target.value })}
                className="input-field appearance-none"
              >
                {GEARBOXES.map(g => <option key={g} value={g}>{g}</option>)}
                <option value="Other">أخرى (إدخال يدوي)</option>
              </select>
              {formData.gearbox === 'Other' && (
                <input
                  type="text"
                  placeholder="ادخل نوع العلبة يدوياً"
                  value={formData.customGearbox}
                  onChange={(e) => setFormData({ ...formData, customGearbox: e.target.value })}
                  className="input-field mt-2"
                />
              )}
            </div>
          </div>
        </section>

        {/* Repairs Section */}
        <section className="glass-card p-8 space-y-6">
          <h3 className="text-xl font-bold">الأجزاء المعاودة (Réparations)</h3>
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

        {/* Location & Privacy */}
        <section className="glass-card p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            <div className="space-y-2 flex flex-col justify-center">
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-green/50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.showPhone}
                  onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })}
                  className="w-5 h-5 accent-brand-green"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-bold">إظهار رقم الهاتف</span>
                  <p className="text-[10px] text-white/40">سيتمكن المشترون من رؤية رقمك المسجل</p>
                </div>
              </label>
            </div>
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
