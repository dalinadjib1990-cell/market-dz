import fs from 'fs';
let content = fs.readFileSync('firestore.rules', 'utf8');

const newMessagesRule = `
    match /messages/{messageId} {
      allow read: if isSignedIn() && request.auth.uid in get(/databases/$(database)/documents/chats/$(existing().chatId)).data.participants;
      allow create: if isSignedIn() 
        && isValidMessage(incoming())
        && request.auth.uid in get(/databases/$(database)/documents/chats/$(incoming().chatId)).data.participants;
      allow update: if isAdmin() || (
        isSignedIn() 
        && request.auth.uid in get(/databases/$(database)/documents/chats/$(existing().chatId)).data.participants
        && (
          (incoming().diff(existing()).affectedKeys().hasOnly(['read']) && incoming().read == true) ||
          (existing().senderId == request.auth.uid && incoming().diff(existing()).affectedKeys().hasOnly(['text', 'editedAt', 'edited', 'deleted']))
        )
      );
      allow delete: if isAdmin() || (
        isSignedIn() && existing().senderId == request.auth.uid
      );
    }`;

content = content.replace(
  /match \/messages\/\{messageId\} \{[\s\S]*?allow delete: if isAdmin\(\) \|\| \(\n        isSignedIn\(\) && existing\(\).senderId == request.auth.uid\n      \);\n    \}/g,
  newMessagesRule.trim()
);

fs.writeFileSync('firestore.rules', content);
console.log("Firestore rules updated for messages edit/delete keys");
