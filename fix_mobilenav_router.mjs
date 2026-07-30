import fs from 'fs';
let content = fs.readFileSync('src/components/MobileNav.tsx', 'utf8');

content = content.replace(
  /import \{ Link, useLocation \} from 'react-router-dom';/g,
  "import { useNavigate, useLocation } from 'react-router-dom';"
);

content = content.replace(
  /const location = useLocation\(\);/g,
  "const location = useLocation();\n  const navigate = useNavigate();"
);

content = content.replace(
  /window\.location\.href = item\.path;/g,
  "navigate(item.path);"
);

fs.writeFileSync('src/components/MobileNav.tsx', content);
console.log("MobileNav router fixed");
