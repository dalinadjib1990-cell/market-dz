import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

// First let's check what the structure looks like, but the user says it suddenly disappears.
// Wait, if it suddenly disappears, it's probably because it's being added locally, then the onSnapshot replaces it, or it doesn't match the query.
// But the snapshot should pick it up. Wait! The snapshot on messages uses 'where("chatId", "==", activeChat.id)'.
// It's possible that the message sorting is failing because createdAt is a serverTimestamp(), which is null initially on the client before it reaches the server.
// `getTime(a.createdAt) - getTime(b.createdAt)` -> if it's null it returns 0.

// Let's modify the sorting function to handle missing timestamps better.
// Actually, firestore gives it a timestamp if we include includeMetadataChanges, but here we aren't.
// Let's just fix the sorting to place messages without timestamps at the end.
const oldSort = `      updatedMessages.sort((a, b) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (typeof val.toMillis === 'function') return val.toMillis();
          if (val.seconds) return val.seconds * 1000;
          return 0;
        };
        return getTime(a.createdAt) - getTime(b.createdAt);
      });`;

const newSort = `      updatedMessages.sort((a, b) => {
        const getTime = (val: any) => {
          if (!val) return Date.now(); // Assume new messages without timestamps are now
          if (typeof val.toMillis === 'function') return val.toMillis();
          if (val.seconds) return val.seconds * 1000;
          return Date.now();
        };
        return getTime(a.createdAt) - getTime(b.createdAt);
      });`;

content = content.replace(oldSort, newSort);

// Make the AI message styling more like the normal ad card
// In AdDetails, the chart looks like:
// <div className="w-full bg-black/40 rounded-2xl p-6 md:p-8 border border-white/10 mt-4 shadow-xl">
//   <h4 className="text-xl md:text-2xl font-bold text-white/90 mb-8 text-center flex items-center justify-center gap-3">
//     <span className="w-8 h-[2px] bg-indigo-500 rounded-full"></span>
//     توقعات مصاريف الصيانة والترقيع
//     <span className="w-8 h-[2px] bg-indigo-500 rounded-full"></span>
//   </h4>

content = content.replace(
  /<div className="w-full bg-black\/40 rounded-xl p-4 md:p-5 border border-indigo-500\/30 mt-4 shadow-lg">/g,
  '<div className="w-full bg-black/40 rounded-xl p-4 md:p-5 border border-white/10 mt-4 shadow-xl">'
);

content = content.replace(
  /<h4 className="text-base font-bold text-white mb-5 text-center flex items-center justify-center gap-2">/g,
  '<h4 className="text-base md:text-lg font-bold text-white/90 mb-5 text-center flex items-center justify-center gap-2">'
);

content = content.replace(
  /<span className="w-4 h-\[2px\] bg-indigo-500\/50 rounded-full"><\/span>/g,
  '<span className="w-6 h-[2px] bg-indigo-500 rounded-full"></span>'
);

// Also make the message wrapper styling less blue/purple to match the dark theme
content = content.replace(
  /isAI \n                           \? "bg-gradient-to-br from-indigo-900\/30 to-blue-900\/10 text-white rounded-2xl border border-indigo-500\/20 w-full p-4 md:p-5"/g,
  'isAI \n                           ? "bg-[#18181b] text-white rounded-2xl border border-white/10 w-full p-4 md:p-5 shadow-xl"'
);

// We need to also check the chat bubble styling:
// In the chat it says: "bg-gradient-to-br from-indigo-900/30 to-blue-900/10 text-white rounded-2xl border border-indigo-500/20 w-full p-4 md:p-5"
// Let's replace the one without the \n since my regex might be wrong
content = content.replace(
  /isAI\s*\?\s*"bg-gradient-to-br from-indigo-900\/30 to-blue-900\/10 text-white rounded-2xl border border-indigo-500\/20 w-full p-4 md:p-5"/g,
  'isAI \n                           ? "bg-[#18181b] text-white rounded-2xl border border-white/10 w-full p-4 md:p-5 shadow-xl"'
);

// Make the bot icon header in the chat message have brand-green
content = content.replace(
  /<div className="flex items-center gap-2 mb-3 text-indigo-400 font-bold border-b border-indigo-500\/20 pb-2">/g,
  '<div className="flex items-center gap-2 mb-3 text-brand-green font-bold border-b border-white/10 pb-2">'
);

fs.writeFileSync('src/pages/Messages.tsx', content);
console.log("Fixed styling and sorting");
