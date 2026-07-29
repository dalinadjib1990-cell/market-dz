import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60; // Increase Vercel timeout to 60s

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

    // Check individual variables like GEMINI_API_KEY_1
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith('GEMINI_API_KEY_') && typeof value === 'string') {
        keys.push(value.trim());
      }
    }

    // Remove duplicates
    keys = [...new Set(keys)].filter(k => k.length > 0);
    
    if (keys.length === 0) {
      return res.status(500).json({ error: "لم يتم العثور على مفاتيح API." });
    }

    let lastError = null;
    const { adDetails, marketData } = req.body;
    
    const systemInstruction = `أنت خبير جزائري محترف في تحليل سوق السيارات (Market Auto DZ).
      مهمتك هي تحليل الإعلان المقدم ومقارنته بالبيانات المتوفرة في السوق لتوفير رؤية شاملة.
      يجب أن ترد بصيغة JSON فقط، بدون أي نصوص إضافية، وفقاً للهيكل التالي:
      {
        "trendData": [
          {"name": "الشهر الماضي", "price": 1200000},
          {"name": "الأسبوع الماضي", "price": 1150000},
          {"name": "الآن", "price": 1100000}
        ],
        "marketStatus": "Rising" | "Stable" | "Falling",
        "fairPrice": 1100000,
        "supplyDemand": "High" | "Medium" | "Low",
        "avgSellingTime": "14",
        "similarListings": 12,
        "regionalComparison": [
          {"region": "العاصمة", "price": 1150000},
          {"region": "وهران", "price": 1100000},
          {"region": "سطيف", "price": 1050000}
        ],
        "recommendation": "Buy Now" | "Wait" | "Negotiate" | "Avoid",
        "bestTimeToBuy": "نصيحة قصيرة جداً، مثلاً: بداية الشتاء أو الآن لأن الأسعار منخفضة",
        "explanation": "شرح قصير ومقنع بالدارجة الجزائرية لسبب هذا التوصية بناءً على المعطيات."
      }
      ملاحظة: السعر في trendData، fairPrice، و regionalComparison يجب أن يكون بالدينار الجزائري (دج).
      أنت متصل بالإنترنت الآن! استخدم أداة البحث في جوجل (googleSearch tool) للبحث في المواقع الجزائرية لمعرفة أحدث الأسعار لسيارات مماثلة في السوق الحقيقي وتوفير بيانات دقيقة ومحدثة اليوم.
      
      إذا لم تتوفر لديك بيانات حقيقية كافية، استخدم خبرتك في السوق الجزائري لتقدير هذه الأرقام بشكل منطقي ومقنع. **تنبيه صارم**: الأسعار في الجزائر مرتفعة بشكل جنوني (مثلاً كليو كومبيس 2007 يتراوح سعرها بين 100 و 140 مليون سنتيم). إياك أن تصنف هذه الأسعار على أنها "غير منطقية" أو "خيالية"! هذا هو الواقع الحالي للسوق (Mise à jour). تقييمات للمجال السعري يجب أن تتبنى هذه الأسعار المتضخمة كمعيار طبيعي وعادي جداً.`;

    let textContent = adDetails?.title ? `معلومات الإعلان الحالي:
العنوان: ${adDetails.title || 'غير متوفر'}
السعر: ${adDetails.price ? adDetails.price + ' دج' : 'غير متوفر'}
سوموني (أعلى عرض): ${adDetails.samouni ? adDetails.samouni + ' دج' : 'غير متوفر'}
الولاية: ${adDetails.wilaya || 'غير متوفر'}
الماركة: ${adDetails.brand || 'غير متوفر'}
سنة الصنع: ${adDetails.year || 'غير متوفر'}
المسافة المقطوعة: ${adDetails.mileage ? adDetails.mileage + ' كم' : 'غير متوفر'}

بيانات السوق المتاحة (سيارات مشابهة):
${JSON.stringify(marketData || [])}` : `طلب تحليل عام للسوق الجزائري للسيارات، يرجى تقديم نظرة عامة عن الأسعار، أكثر السيارات مبيعاً والتوجه الحالي للسوق.
بيانات السوق الحالية:
${JSON.stringify(marketData || [])}`;

    const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);
    const maxTries = Math.min(shuffledKeys.length, 3);
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-8b"];

    for (let i = 0; i < maxTries; i++) {
      for (const modelName of modelsToTry) {
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
            model: modelName,
            contents: textContent,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.5,
              tools: [{ googleSearch: {} }]
            },
          });

          let responseText = response.text || '';
          const jsonMatch = responseText.match(/\{.*\}/s);
          if (jsonMatch) {
            responseText = jsonMatch[0];
          } else {
            responseText = responseText.replace(/```(json)?/g, '').trim();
          }

          return res.status(200).json(JSON.parse(responseText));
        } catch (error: any) {
          console.error(`Error with key index ${i} using model ${modelName}:`, error.message);
          lastError = error;
        }
      }
    }

    return res.status(500).json({ error: "عذراً، تم تجاوز الحد المسموح به للطلبات المجانية في الوقت الحالي." });
  } catch (error: any) {
    console.error("Final Error from Gemini:", error);
    return res.status(500).json({ error: "حدث خطأ أثناء تحليل السوق." });
  }
}
