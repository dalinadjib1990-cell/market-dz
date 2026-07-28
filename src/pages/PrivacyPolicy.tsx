import React from 'react';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-green/10 text-brand-green mb-6">
          <Shield size={32} />
        </div>
        <h1 className="text-3xl md:text-5xl font-black mb-4">سياسة الخصوصية</h1>
        <p className="text-white/60">آخر تحديث: {new Date().toLocaleDateString('ar-DZ')}</p>
      </div>

      <div className="glass-card p-6 md:p-10 space-y-12">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-brand-green flex items-center gap-2">
            1. مقدمة
          </h2>
          <div className="text-white/70 leading-relaxed space-y-4">
            <p>
              مرحباً بكم في منصة <strong className="text-white">Market Auto DZ</strong>. نحن نقدر خصوصيتكم ونلتزم بحماية بياناتكم الشخصية. تشرح سياسة الخصوصية هذه كيفية جمعنا للمعلومات، واستخدامها، ومشاركتها عند استخدامكم لتطبيقنا وموقعنا الإلكتروني.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-brand-green flex items-center gap-2">
            2. المعلومات التي نجمعها
          </h2>
          <div className="text-white/70 leading-relaxed space-y-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">معلومات التسجيل:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، والولاية.</li>
              <li><strong className="text-white">معلومات الإعلانات:</strong> تفاصيل السيارات التي تقوم بعرضها، الصور، الأسعار، والمواصفات.</li>
              <li><strong className="text-white">معلومات التواصل:</strong> الرسائل المتبادلة بين البائعين والمشترين داخل المنصة.</li>
              <li><strong className="text-white">معلومات تقنية:</strong> عنوان IP، نوع المتصفح، ومعلومات الجهاز المستخدم.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-brand-green flex items-center gap-2">
            3. كيف نستخدم معلوماتك
          </h2>
          <div className="text-white/70 leading-relaxed space-y-4">
            <ul className="list-disc list-inside space-y-2">
              <li>إنشاء وإدارة حسابك وتوفير خدمات المنصة.</li>
              <li>نشر إعلانات السيارات الخاصة بك وتسهيل التواصل مع المشترين.</li>
              <li>تحسين جودة خدماتنا وتجربة المستخدم.</li>
              <li>التواصل معك بخصوص التحديثات، والدعم الفني، أو التنبيهات الأمنية.</li>
              <li>حماية المنصة من الاحتيال، الرسائل المزعجة، والاستخدام غير القانوني.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-brand-green flex items-center gap-2">
            4. مشاركة المعلومات
          </h2>
          <div className="text-white/70 leading-relaxed space-y-4">
            <p>
              نحن لا نبيع بياناتك الشخصية لأطراف ثالثة. نشارك المعلومات فقط في الحالات التالية:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">مع المستخدمين الآخرين:</strong> المعلومات العامة في إعلانك (مثل رقم الهاتف إذا اخترت إظهاره، والولاية) تكون مرئية للمستخدمين الآخرين.</li>
              <li><strong className="text-white">الالتزام القانوني:</strong> إذا طُلب منا ذلك بموجب القانون أو لحماية حقوقنا وأمان المستخدمين.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-brand-green flex items-center gap-2">
            5. أمان البيانات
          </h2>
          <div className="text-white/70 leading-relaxed space-y-4">
            <p>
              نحن نتخذ إجراءات أمنية صارمة، بما في ذلك التشفير وقواعد حماية قواعد البيانات (مثل Firebase Security Rules)، لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التعديل أو الكشف أو الإتلاف.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-brand-green flex items-center gap-2">
            6. حقوقك
          </h2>
          <div className="text-white/70 leading-relaxed space-y-4">
            <p>لديك الحق في:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>الوصول إلى بياناتك الشخصية وتحديثها من خلال إعدادات حسابك.</li>
              <li>حذف إعلاناتك أو حسابك بالكامل في أي وقت.</li>
              <li>تعديل إعدادات الخصوصية المتعلقة بإظهار رقم هاتفك للمستخدمين.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-brand-green flex items-center gap-2">
            7. التغييرات على سياسة الخصوصية
          </h2>
          <div className="text-white/70 leading-relaxed space-y-4">
            <p>
              قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سيتم نشر أي تغييرات على هذه الصفحة، ونشجعك على مراجعتها بشكل دوري.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-brand-green flex items-center gap-2">
            8. اتصل بنا
          </h2>
          <div className="text-white/70 leading-relaxed space-y-4">
            <p>
              إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر:
            </p>
            <p className="font-bold text-white">البريد الإلكتروني: dalinadjib1990@gmail.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}
