import fs from 'fs';
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Update imports
content = content.replace(
  /import React from 'react';/,
  "import React, { useState } from 'react';"
);
content = content.replace(
  /import \{ useAuth \} from '\.\.\/hooks\/useAuth';/,
  "import { useAuth } from '../hooks/useAuth';\nimport MarketAnalysisPopup from './MarketAnalysisPopup';\nimport { LineChart as LineChartIcon } from 'lucide-react';"
);

// Add state
content = content.replace(
  /const \{ user, profile, isAdmin \} = useAuth\(\);/,
  "const { user, profile, isAdmin } = useAuth();\n  const [showMarketAnalysis, setShowMarketAnalysis] = useState(false);"
);

// Add button
let buttonCode = `          <button 
            onClick={() => setShowMarketAnalysis(true)}
            className="flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 hidden lg:flex"
          >
            <LineChartIcon className="w-4 h-4" />
            تحليل السوق
          </button>
`;
content = content.replace(
  /<a \s*href="https:\/\/chat-gpt-emploi\.vercel\.app/,
  buttonCode + '          <a \n             href="https://chat-gpt-emploi.vercel.app'
);

// Add popup component
content = content.replace(
  /    <\/header>/,
  "      <MarketAnalysisPopup isOpen={showMarketAnalysis} onClose={() => setShowMarketAnalysis(false)} />\n    </header>"
);

fs.writeFileSync('src/components/Header.tsx', content);
