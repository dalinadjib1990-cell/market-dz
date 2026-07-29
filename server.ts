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

      يرجى تنظيم إجابتك لتكون واضحة باستخدام تنسيق Markdown.
      هام جداً بشأن التلوين: استخدم وسوم HTML لتلوين النصوص والأشياء التي تذكرها:
      - الأشياء الجيدة والممتازة لونها بالأخضر هكذا: <span style="color: #4ade80">النص هنا</span>
      - الأشياء المتوسطة والمقبولة لونها بالبرتقالي هكذا: <span style="color: #f97316">النص هنا</span>
      - الأشياء السيئة والسلبية (أو المصاريف الكبيرة) لونها بالأحمر هكذا: <span style="color: #ef4444">النص هنا</span>

      يجب أن يشمل تقييمك:
      1. **نظرة عامة**: رأيك السريع.
      2. **تحليل الصور وتبرير الحكم**: إذا تم إرفاق صور مع الطلب، قم بتحليلها بدقة لتقييم حالة الهيكل (الصبيغة، الصدمات)، الصالون، العجلات، والمحرك إن وجد. **وضح سبب حكمك بشكل دقيق** (مثلاً: "لاحظت اختلاف لون الرفرف الأمامي"، أو "وجود فجوة غير طبيعية بين الباب والهيكل"، أو "آثار فك في براغي غطاء المحرك"). لا تكتفِ بإعطاء النتيجة النهائية فقط، بل اشرح للمستخدم ما رأيته بالضبط في الصور أو استنتجته من الوصف لتبني الثقة.
      3. **تحليل حالة السيارة ومصاريف الترقيع**: توقع المصاريف المحتملة في المحرك، الهيكل، نظام التعليق، والكهرباء بناءً على وصف الإعلان والصور وسنة الصنع والممشى.
      4. **تحليل السعر**: قارن السعر المطلوب بحالة السوق الحالية، واقترح مجالاً سعرياً عادلاً.
      5. **نصيحة أخيرة للمشتري**: نصيحة صريحة ومباشرة عما إذا كان يستحق شراء السيارة أم لا. راعِ ظروف المشتري ذي الميزانية المحدودة (الزوالي)، وانصحه بواقعية إذا كانت السيارة تناسب ميزانيته أو ستتعبه بمصاريف الصيانة والترقيع.

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

      let textContent = `معلومات الإعلان:
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

      const contentsPart: any[] = [textContent];

      if (adDetails.images && Array.isArray(adDetails.images)) {
        // Fetch up to 3 images to avoid payload size issues or timeouts
        for (const imgUrl of adDetails.images.slice(0, 3)) {
          try {
             const imgRes = await fetch(imgUrl);
             if (imgRes.ok) {
                const arrayBuffer = await imgRes.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
                contentsPart.push({
                   inlineData: {
                     data: buffer.toString('base64'),
                     mimeType: mimeType
                   }
                });
             }
          } catch (e) {
             console.error('Failed to fetch image for AI assessment:', e);
          }
        }
      }

      // Try keys randomly or sequentially until one succeeds
      const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);
      const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-pro-preview", "gemini-flash-latest"];

      let isRateLimited = false;

      for (let i = 0; i < shuffledKeys.length; i++) {
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
              contents: contentsPart,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
              },
            });

            return res.json({ reply: response.text });
          } catch (error: any) {
            console.error(`Error with key index ${i} using model ${modelName}:`, error.message);
            lastError = error;
            if (error?.message?.includes('429') || error?.message?.includes('Quota exceeded') || error?.status === 'RESOURCE_EXHAUSTED') {
                isRateLimited = true;
            }
            // If it's a 429 Too Many Requests or 503, continue to the next model/key.
          }
        }
      }

      // If all keys failed
      if (isRateLimited) {
        return res.status(429).json({ error: "عذراً، تم تجاوز الحد المسموح به للطلبات المجانية في الوقت الحالي (ضغط كبير على النظام). يرجى المحاولة مرة أخرى بعد دقيقة." });
      }
      throw lastError || new Error("جميع مفاتيح API فشلت");
    } catch (error) {
      console.error("Final Error from Gemini:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تقييم السيارة. الرجاء المحاولة مرة أخرى." });
    }
  });

  // API Route for Market Analysis
  app.post("/api/gemini/market-analysis", async (req, res) => {
    try {
      const keys = getGeminiKeys();
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
      إذا لم تتوفر لديك بيانات حقيقية كافية، استخدم خبرتك في السوق الجزائري لتقدير هذه الأرقام بشكل منطقي ومقنع بناءً على السيارة وسنة الصنع والمسافة المقطوعة.`;

      let textContent = `معلومات الإعلان الحالي:
العنوان: ${adDetails.title || 'غير متوفر'}
السعر: ${adDetails.price ? adDetails.price + ' دج' : 'غير متوفر'}
سوموني (أعلى عرض): ${adDetails.samouni ? adDetails.samouni + ' دج' : 'غير متوفر'}
الولاية: ${adDetails.wilaya || 'غير متوفر'}
الماركة: ${adDetails.brand || 'غير متوفر'}
سنة الصنع: ${adDetails.year || 'غير متوفر'}
المسافة المقطوعة: ${adDetails.mileage ? adDetails.mileage + ' كم' : 'غير متوفر'}

بيانات السوق المتاحة (سيارات مشابهة):
${JSON.stringify(marketData || [])}`;

      // Try keys randomly or sequentially until one succeeds
      const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);
      const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-pro-preview", "gemini-flash-latest"];

      let isRateLimited = false;
      for (let i = 0; i < shuffledKeys.length; i++) {
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
              },
            });

            let responseText = response.text || '';
            const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
              responseText = jsonMatch[1];
            } else {
              responseText = responseText.replace(/```/g, '').trim();
            }

            return res.json(JSON.parse(responseText));

          } catch (error: any) {
            console.error(`Error with key index ${i} using model ${modelName} in market-analysis:`, error.message);
            lastError = error;
            if (error?.message?.includes('429') || error?.message?.includes('Quota exceeded') || error?.status === 'RESOURCE_EXHAUSTED') {
                isRateLimited = true;
            }
          }
        }
      }

      if (isRateLimited) {
        return res.status(429).json({ error: "عذراً، تم تجاوز الحد المسموح به للطلبات المجانية في الوقت الحالي." });
      }
      throw lastError || new Error("جميع مفاتيح API فشلت");

    } catch (error) {
      console.error("Final Error from Gemini in market-analysis:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تحليل السوق." });
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
