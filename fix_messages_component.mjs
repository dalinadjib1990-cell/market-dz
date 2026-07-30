import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

// Add isWidget prop
content = content.replace(
  /export default function Messages\(\) \{/g,
  'export default function Messages({ isWidget = false }: { isWidget?: boolean }) {'
);

// Replace URLSearchParams check with isWidget prop
content = content.replace(
  /new URLSearchParams\(window.location.search\).get\('widget'\) === 'true'/g,
  'isWidget'
);

// Fix height logic for widget
content = content.replace(
  /isWidget \? 'h-\[100dvh\] py-0' : 'h-\[calc\(100dvh-64px\)\]/g,
  "isWidget ? 'h-full py-0' : 'h-[calc(100dvh-64px)]"
);

fs.writeFileSync('src/pages/Messages.tsx', content);
console.log("Messages component fixed");
