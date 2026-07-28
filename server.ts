import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Helper to get all available Gemini keys
  const getGeminiKeys = () => {
    let keys: string[] = [];
    
    // 1. Check comma-separated lists
    const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEYS || process.env.VITE_GEMINI_API_KEY || "";
    if (keysString) {
      keys = keys.concat(keysString.split(',').map(k => k.trim()).filter(k => k.length > 0));
    }

    // 2. Check for individual variables like GEMINI_API_KEY_1, GEMINI_API_KEY_2
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith('GEMINI_API_KEY_') && typeof value === 'string') {
        keys.push(value.trim());
      }
    }

    // Remove duplicates
    keys = [...new Set(keys)].filter(k => k.length > 0);
    
    if (keys.length === 0) {
      throw new Error("لم يتم العثور على مفاتيح API. يرجى التأكد من إضافة GEMINI_API_KEY_1, GEMINI_API_KEY_2 في Vercel.");
    }
    return keys;
  };

  // API Route for AI Car Assessment
  app.post("/api/gemini/assess-car", async (req, res) => {
    try {
      const keys = getGeminiKeys();
      let lastError = null;
      const { adDetails, messages, role, userMessage } = req.body;
      
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
العنوان: ${adDetails.title || 'غير متوفر'}
السعر: ${adDetails.price ? adDetails.price + ' دج' : 'غير متوفر'}
سوموني (أعلى عرض): ${adDetails.samouni ? adDetails.samouni + ' دج' : 'غير متوفر'}
الولاية: ${adDetails.wilaya || 'غير متوفر'}
الماركة: ${adDetails.brand || 'غير متوفر'}
سنة الصنع: ${adDetails.year || 'غير متوفر'}
المسافة المقطوعة: ${adDetails.mileage ? adDetails.mileage + ' كم' : 'غير متوفر'}
الوصف: ${adDetails.description || 'غير متوفر'}
الطاقة: ${adDetails.fuelType || 'غير متوفر'}
ناقل الحركة: ${adDetails.transmission || 'غير متوفر'}
الطلاء (معاود/أصلية): ${adDetails.paint || 'غير متوفر'}

رسالة المستخدم (${role === 'seller' ? 'البائع' : 'المشتري'}):
${userMessage}
`;

      // Try keys randomly or sequentially until one succeeds
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
          // If it's a 429 Too Many Requests or 503, continue to the next key. Otherwise, we can still try but it might fail similarly.
        }
      }

      // If all keys failed
      throw lastError || new Error("جميع مفاتيح API فشلت");
    } catch (error) {
      console.error("Final Error from Gemini:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تقييم السيارة. الرجاء المحاولة مرة أخرى." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
