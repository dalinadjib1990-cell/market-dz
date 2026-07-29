import fs from 'fs';
let content = fs.readFileSync('src/components/Hero.tsx', 'utf8');

// Add import for MarketAnalysisPopup and LineChartIcon
content = content.replace(
  /import \{ BRANDS, WILAYAS \} from '\.\.\/constants\/data';/,
  "import { BRANDS, WILAYAS } from '../constants/data';\nimport MarketAnalysisPopup from './MarketAnalysisPopup';\nimport { LineChart as LineChartIcon } from 'lucide-react';"
);

// Add state
content = content.replace(
  /const \[search, setSearch\] = useState\(''\);/,
  "const [search, setSearch] = useState('');\n  const [showMarketAnalysis, setShowMarketAnalysis] = useState(false);"
);

// Add button
let buttonCode = `
            <button 
              onClick={() => setShowMarketAnalysis(true)}
              className="btn-secondary !bg-emerald-500/10 !border-emerald-500/30 !text-emerald-400 !py-4 !px-8 text-lg shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-105 hover:bg-emerald-500/20 transition-all flex items-center gap-3 backdrop-blur-md"
            >
              <LineChartIcon size={24} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              تحليل السوق
            </button>
`;

content = content.replace(
  /<a \s*href="https:\/\/chat-gpt-emploi\.vercel\.app/,
  buttonCode + '\n            <a \n              href="https://chat-gpt-emploi.vercel.app'
);

// Add popup
content = content.replace(
  /<\/div>\n    <\/div>\n  \);\n\}/,
  "      </div>\n      <MarketAnalysisPopup isOpen={showMarketAnalysis} onClose={() => setShowMarketAnalysis(false)} />\n    </div>\n  );\n}"
);

fs.writeFileSync('src/components/Hero.tsx', content);
