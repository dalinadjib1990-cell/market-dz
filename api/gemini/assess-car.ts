import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60; // Increase Vercel timeout to 60s (works if they have Pro)

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let keys: string[] = [];
    
    // Check comma-separated lists
    const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEYS || process.env.VITE_GEMINI_API_KEY || "";
    if (keysString) {
      keys = keys.concat(keysString.split(',').map(k => k.trim()).filter(k => k.length > 0));
    }

    // Check individual variables like GEMINI_API_KEY_1, GEMINI_API_KEY_2
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith('GEMINI_API_KEY_') && typeof value === 'string') {
        keys.push(value.trim());
      }
    }

    // Remove duplicates
    keys = [...new Set(keys)].filter(k => k.length > 0);
    
    if (keys.length === 0) {
      return res.status(500).json({ error: "لم يتم العثور على مفاتيح API. يرجى التأكد من إضافة GEMINI_API_KEY_1, GEMINI_API_KEY_2 في Vercel." });
    }

    let lastError = null;
    const { adDetails, role, userMessage } = req.body;
    
    const systemInstruction = `أنت خبير جزائري محترف في تقييم السيارات (Market Auto DZ). اسمك "الخبير الآلي". مهمتك هي مساعدة البائع والمشتري في الوصول إلى سعر عادل وتوضيح حالة السيارة.
تحدث بالدارجة الجزائرية الواضحة والمهذبة.
كن صريحاً جداً بشأن السعر وحالة السيارة.
ملاحظة هامة جداً: في الجزائر، غالباً ما يختصر الناس الأصفار في الأسعار. فمثلاً إذا كتب شخص "77" فهو يقصد غالباً "77 مليون سنتيم" (770,000 دج)، وإذا كتب "120" فهو يقصد "120 مليون سنتيم". خذ هذا بعين الاعتبار في تحليلك للسعر.

يرجى تنظيم إجابتك لتكون واضحة باستخدام تنسيق Markdown (النجمة المزدوجة **للنصوص المهمة**).
يجب أن يشمل تقييمك:
1. **نظرة عامة**: رأيك السريع.
2. **تحليل حالة السيارة ومصاريف الترقيع**: توقع المصاريف المحتملة في المحرك، الهيكل، نظام التعليق، والكهرباء بناءً على وصف الإعلان وسنة الصنع والممشى.
3. **تحليل السعر**: قارن السعر المطلوب بحالة السوق الحالية، واقترح مجالاً سعرياً عادلاً.

لتقديم رسم بياني لتوقعات مصاريف الإصلاح والتجديد (بالدينار الجزائري)، قم دائماً بتضمين كتلة JSON في نهاية ردك بالتنسيق التالي بالضبط (يجب أن يكون بالدينار الجزائري وليس بملايين السنتيمات في الرسم البياني):
\`\`\`json
{
  "repairCosts": [
    {"name": "المحرك", "cost": 40000},
    {"name": "الهيكل", "cost": 0},
    {"name": "نظام التعليق", "cost": 15000},
    {"name": "الكهرباء", "cost": 5000}
  ]
}
\`\`\`
ضع القيمة 0 إذا كنت تتوقع أن الجزء سليم أو لا يتطلب مصاريف. استنتج هذه التكاليف بناءً على حالة السيارة في الإعلان وسنة صنعها كخبير.`;

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
          model: "gemini-2.5-flash",
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
