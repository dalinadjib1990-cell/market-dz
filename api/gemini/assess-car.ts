import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    const keys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    if (keys.length === 0) {
      throw new Error("GEMINI_API_KEY or GEMINI_API_KEYS is missing");
    }

    let lastError = null;
    const { adDetails, role, userMessage } = req.body;
    
    const systemInstruction = `أنت خبير جزائري في تقييم السيارات. اسمك "الخبير الآلي". مهمتك هي مساعدة البائع والمشتري في الوصول إلى سعر عادل أو تقييم حالة السيارة بناءً على المعلومات المقدمة لك. 
تحدث بالدارجة الجزائرية الواضحة والمهذبة. 
كن صريحاً جداً بشأن السعر وحالة السيارة. 
قم بإعطاء تقييم دقيق بناءً على السوق الجزائري.
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

    for (let i = 0; i < shuffledKeys.length; i++) {
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

        return res.json({ reply: response.text });
      } catch (error: any) {
        console.error(`Error with key index ${i}:`, error.message);
        lastError = error;
      }
    }

    throw lastError || new Error("جميع مفاتيح API فشلت");
  } catch (error) {
    console.error("Final Error from Gemini:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تقييم السيارة. الرجاء المحاولة مرة أخرى." });
  }
}
