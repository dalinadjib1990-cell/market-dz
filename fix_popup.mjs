import fs from 'fs';
let content = fs.readFileSync('src/components/MarketAnalysisPopup.tsx', 'utf8');

const target = `      let q;
      if (ad) {
        q = query(collection(db, 'ads'), where('brand', '==', ad.brand));
      } else {
        q = query(collection(db, 'ads'));
      }
      const snapshot = await getDocs(q);
      const similarAds = snapshot.docs.map(doc => doc.data()).slice(0, 10);`;

const replacement = `      let similarAds = [];
      try {
        let q;
        if (ad) {
          q = query(collection(db, 'ads'), where('brand', '==', ad.brand));
        } else {
          q = query(collection(db, 'ads'));
        }
        const snapshot = await getDocs(q);
        similarAds = snapshot.docs.map(doc => doc.data()).slice(0, 10);
      } catch (err) {
        console.error('Failed to fetch similar ads', err);
      }`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/MarketAnalysisPopup.tsx', content);
