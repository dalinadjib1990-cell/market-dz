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

  // Helper to initialize Gemini with API key rotation
  const getGeminiAi = () => {
    const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    const keys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    if (keys.length === 0) {
      throw new Error("GEMINI_API_KEY or GEMINI_API_KEYS is missing");
    }
    
    // Pick a random key for rotation to avoid rate limits
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    
    return new GoogleGenAI({
      apiKey: randomKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // API Route for AI Car Assessment
  app.post("/api/gemini/assess-car", async (req, res) => {
    try {
      const ai = getGeminiAi();
      const { adDetails, messages, role, userMessage } = req.body;
      
      const systemInstruction = `أنت خبير جزائري في تقييم السيارات. اسمك "الخبير الآلي". مهمتك هي مساعدة البائع والمشتري في الوصول إلى سعر عادل أو تقييم حالة السيارة بناءً على المعلومات المقدمة لك. 
      تحدث بالدارجة الجزائرية الواضحة والمهذبة. 
      كن صريحاً جداً بشأن السعر وحالة السيارة. 
      قم بإعطاء تقييم دقيق بناءً على السوق الجزائري.
      مثال للأسلوب: "تسعيرتي بصراحة للسيارة هي 125 مليون، والسبب هو..." أو "السيارة تبان نقية بصح السعر راهو طالع شوية على حساب السوق...".
      حلل المواصفات وأي صور متاحة.
      إذا سألك المشتري أو البائع، أجب بناءً على المعلومات التي لديك.`;

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

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error("Error from Gemini:", error);
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
