import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60; // Increase Vercel timeout to 60s (works if they have Pro)

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    const keys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    if (keys.length === 0) {
      return res.status(500).json({ error: "لم يتم العثور على مفاتيح API. يرجى التأكد من إضافة GEMINI_API_KEYS في Vercel." });
    }

    let lastError = null;
    const { adDetails, role, userMessage } = req.body;
    
    const systemInstruction = `أنت خبير جزائري في تقييم السيارات. اسمك "الخبير الآلي". مهمتك هي مساعدة البائع والمشتري في الوصول إلى سعر عادل أو تقييم حالة السيارة بناءً على المعلومات المقدمة لك. 
تحدث بالدارجة الجزائرية الواضحة والمهذبة. 
كن صريحاً جداً بشأن السعر وحالة السيارة. 
قم بإعطاء تقييم دقيق بناءً على السوق الجزائري.
ملاحظة هامة جداً: في الجزائر، غالباً ما يختصر الناس الأصفار في الأسعار. فمثلاً إذا كتب شخص "77" فهو يقصد غالباً "77 مليون سنتيم" (770,000 دج)، وإذا كتب "120" فهو يقصد "120 مليون سنتيم". خذ هذا بعين الاعتبار في تحليلك للسعر.
مثال للأسلوب: "تسعيرتي بصراحة للسيارة هي 125 مليون، والسبب هو..." أو "السيارة تبان نقية بصح السعر راهو طالع شوية على حساب السوق...".
حلل المواصفات وأي صور متاحة.
إذا سألك المشتري أو البائع، أجب بناءً على المعلومات التي لديك.`;

    let contents = `معلومات الإعلان:
العنوان: ${adDetails?.title || 'غير متوفر'}
السعر: ${adDetails?.price ? adDetails.price + ' دج' : 'غير متوفر'}
سوموني (أعلى عرض): ${adDetails?.samouni ? adDetails.samouni + ' دج' : 'غير متوفر'}
الولاية: ${adDetails?.wilaya || 'غير متوفر'}
الماركة: ${adDetails?.brand || 'غير متوفر'}
سنة الصنع: ${adDetails?.year || 'غير متوفر'}
المسافة المقطوعة: ${adDetails?.mileage ? adDetails.mileage + ' كم' : 'غير متوفر'}
الوصف: ${adDetails?.description || 'غير متوفر'}
الطاقة: ${adDetails?.fuelType || 'غير متوفر'}
ناقل الحركة: ${adDetails?.transmission || 'غير متوفر'}
الطلاء (معاود/أصلية): ${adDetails?.paint || 'غير متوفر'}

رسالة المستخدم (${role === 'seller' ? 'البائع' : 'المشتري'}):
${userMessage}`;

    const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);

    // Limit to trying at most 3 keys to avoid Vercel timeout (10s on hobby)
    const maxTries = Math.min(shuffledKeys.length, 3);

    for (let i = 0; i < maxTries; i++) {
      try {
        const ai = new GoogleGenAI({
          apiKey: shuffledKeys[i],
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          },
        });

        return res.status(200).json({ reply: response.text });
      } catch (error: any) {
        console.error(`Error with key index ${i}:`, error.message);
        lastError = error;
      }
    }

    return res.status(500).json({ error: `جميع المفاتيح فشلت. الخطأ الأخير: ${lastError?.message || 'مجهول'}` });
  } catch (error: any) {
    console.error("Final Error from Gemini:", error);
    return res.status(500).json({ error: `حدث خطأ أثناء تقييم السيارة: ${error.message}` });
  }
}
