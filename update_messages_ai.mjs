import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

// Inside AIMessageContent, it's currently hardcoded with indigo-based styling for the chart.
// Let's modify AIMessageContent to look more like the one in AdDetails (which uses white/indigo).
content = content.replace(
  /<h4 className="text-sm font-bold text-indigo-300 mb-5 text-center flex items-center justify-center gap-2">/g,
  '<h4 className="text-base font-bold text-white mb-5 text-center flex items-center justify-center gap-2">'
);

// We need to find why it disappears.
// Is there a bug in AIMessageContent rendering? Let's check where it's called.
// It seems the user means "when I click the AI expert button inside the chat bubble, the assessment appears as a message, and then suddenly disappears."
// Let's check how the message is saved in Firestore.
fs.writeFileSync('src/pages/Messages.tsx', content);
console.log("Updated styling");
