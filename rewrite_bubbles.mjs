import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

const target = `{messages.map(msg => (
                  <div key={msg.id} className={cn(
                    "flex group",
                    msg.senderId === 'AI_EXPERT' ? "justify-center" : (msg.senderId === user.uid ? "justify-start" : "justify-end")
                  )}>
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-sm relative shadow-lg transition-all hover:scale-[1.01] whitespace-pre-wrap",
                      msg.senderId === 'AI_EXPERT' 
                        ? "bg-gradient-to-br from-indigo-900/40 to-blue-900/20 text-white rounded-2xl border border-indigo-500/30 w-full" 
                        : (msg.senderId === user.uid 
                          ? "bg-gradient-to-br from-brand-green to-emerald-900 text-white rounded-tr-none shadow-brand-green/10" 
                          : "bg-gradient-to-br from-white/10 to-white/5 text-white rounded-tl-none border border-white/10 shadow-black/20")
                    )}>
                      {msg.senderId === 'AI_EXPERT' && (
                        <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold border-b border-indigo-500/20 pb-2">
                          <Bot size={16} />
                          <span>الخبير الآلي (Market Auto DZ)</span>
                        </div>
                      )}`;

const replacement = `{messages.map(msg => {
                  const isMe = msg.senderId === user.uid;
                  const isAI = msg.senderId === 'AI_EXPERT';
                  return (
                  <div key={msg.id} className={cn(
                    "flex group relative",
                    isAI ? "justify-center" : (isMe ? "justify-start" : "justify-end")
                  )}>
                    <div className={cn(
                      "max-w-[85%] px-4 py-2.5 text-[15px] relative shadow-md transition-all whitespace-pre-wrap leading-relaxed",
                      isAI 
                        ? "bg-gradient-to-br from-indigo-900/40 to-blue-900/20 text-white rounded-2xl border border-indigo-500/30 w-full" 
                        : (isMe
                          ? "bg-gradient-to-br from-[#10b981] to-[#047857] text-white rounded-[20px] rounded-tr-[4px] shadow-emerald-900/20" 
                          : "bg-[#1f2937] text-gray-100 rounded-[20px] rounded-tl-[4px] border border-gray-700/50 shadow-black/20")
                    )}>
                      {isAI && (
                        <div className="flex items-center gap-2 mb-3 text-indigo-400 font-bold border-b border-indigo-500/20 pb-2">
                          <Bot size={16} />
                          <span>الخبير الآلي (Market Auto DZ)</span>
                        </div>
                      )}`;

content = content.replace(target, replacement);

const target2 = `{msg.senderId === user.uid && !msg.deleted && (
                        <div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                          <button onClick={() => { setEditingMessageId(msg.id); setEditText(msg.text); }} className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-white"><Edit2 size={12} /></button>
                          <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-500"><Trash2 size={12} /></button>
                        </div>
                      )}

                      {msg.senderId === user.uid && (
                        <div className="absolute -bottom-4 right-0 text-[9px] text-white/20 font-bold flex items-center gap-1">
                          <CheckCircle2 size={8} className={cn(msg.read ? "text-brand-green" : "text-white/20")} />
                          {msg.read ? 'تمت القراءة' : 'تم الإرسال'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />`;

const replacement2 = `{isMe && !msg.deleted && (
                        <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 z-10 bg-black/40 p-1 rounded-lg backdrop-blur-sm border border-white/5">
                          <button onClick={() => { setEditingMessageId(msg.id); setEditText(msg.text); }} className="p-1.5 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors"><Edit2 size={12} /></button>
                          <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 hover:bg-red-500/20 rounded-md text-white/40 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                        </div>
                      )}

                      {isMe && (
                        <div className="absolute -bottom-4 right-1 text-[10px] text-white/30 font-medium flex items-center gap-1">
                          <CheckCircle2 size={10} className={cn(msg.read ? "text-brand-green" : "text-white/30")} />
                          {msg.read ? 'تمت القراءة' : 'تم الإرسال'}
                        </div>
                      )}
                    </div>
                  </div>
                )})}
                <div ref={messagesEndRef} />`;

content = content.replace(target2, replacement2);
fs.writeFileSync('src/pages/Messages.tsx', content);
