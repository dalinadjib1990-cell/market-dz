import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

const target = `{messages.map(msg => {
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
                      )}
                      {editingMessageId === msg.id ? (
                        <div className="space-y-2 min-w-[200px]">
                          <input 
                            type="text" 
                            value={editText} 
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-base outline-none"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingMessageId(null)} className="text-[10px] text-white/40">إلغاء</button>
                            <button onClick={() => handleEditMessage(msg.id)} className="text-[10px] text-brand-green font-bold">حفظ</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="Sent" className="rounded-xl mb-2 max-w-full h-auto cursor-pointer hover:opacity-90" onClick={() => window.open(msg.imageUrl)} />
                          )}
                          {isAI ? (
                            <AIMessageContent text={msg.text} />
                          ) : (
                            <p className={cn(msg.deleted && "italic text-white/20", "m-0")}>{msg.text}</p>
                          )}
                          {msg.edited && !msg.deleted && <span className="text-[8px] text-white/20 block mt-1">(معدلة)</span>}
                        </>
                      )}
                      
                      {isMe && !msg.deleted && (
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
                )})}`;

const replacement = `{messages.map(msg => {
                  const isMe = msg.senderId === user.uid;
                  const isAI = msg.senderId === 'AI_EXPERT';
                  return (
                  <div key={msg.id} className={cn(
                    "flex group relative w-full mb-6",
                    isAI ? "justify-center" : (isMe ? "justify-start" : "justify-end")
                  )}>
                    <div className={cn(
                      "max-w-[85%] md:max-w-[70%] relative shadow-sm whitespace-pre-wrap leading-relaxed",
                      isAI 
                        ? "bg-gradient-to-br from-indigo-900/30 to-blue-900/10 text-white rounded-2xl border border-indigo-500/20 w-full p-4 md:p-5" 
                        : (isMe
                          ? "bg-brand-green text-white rounded-[18px] rounded-tr-[4px] px-4 py-2.5 text-[15px]" 
                          : "bg-[#27272a] text-gray-100 rounded-[18px] rounded-tl-[4px] border border-white/5 px-4 py-2.5 text-[15px]")
                    )}>
                      {isAI && (
                        <div className="flex items-center gap-2 mb-3 text-indigo-400 font-bold border-b border-indigo-500/20 pb-2">
                          <Bot size={16} />
                          <span>الخبير الآلي (Market Auto DZ)</span>
                        </div>
                      )}
                      {editingMessageId === msg.id ? (
                        <div className="space-y-2 min-w-[200px]">
                          <input 
                            type="text" 
                            value={editText} 
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-base outline-none text-white focus:border-brand-green"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setEditingMessageId(null)} className="px-3 py-1 text-xs text-white/50 hover:text-white bg-white/5 rounded-md transition-colors">إلغاء</button>
                            <button onClick={() => handleEditMessage(msg.id)} className="px-3 py-1 text-xs text-white bg-brand-green/80 hover:bg-brand-green rounded-md transition-colors font-medium">حفظ</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {msg.imageUrl && (
                            <div className="relative rounded-xl overflow-hidden mb-2 group/image">
                              <img src={msg.imageUrl} alt="Sent" className="max-w-[240px] max-h-[300px] object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300" onClick={() => window.open(msg.imageUrl)} />
                            </div>
                          )}
                          {isAI ? (
                            <AIMessageContent text={msg.text} />
                          ) : (
                            <div className={cn(msg.deleted && "italic text-white/40", "m-0")}>{msg.text}</div>
                          )}
                          {msg.edited && !msg.deleted && <span className="text-[10px] text-white/40 block mt-1.5 opacity-70">(معدلة)</span>}
                        </>
                      )}
                      
                      {isMe && !msg.deleted && (
                        <div className="absolute -left-12 top-0 bottom-0 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-center gap-1.5 z-10">
                          <button onClick={() => { setEditingMessageId(msg.id); setEditText(msg.text); }} className="w-8 h-8 flex items-center justify-center bg-[#18181b] border border-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors shadow-lg shadow-black/20 transform hover:scale-110"><Edit2 size={13} /></button>
                          <button onClick={() => handleDeleteMessage(msg.id)} className="w-8 h-8 flex items-center justify-center bg-[#18181b] border border-white/10 rounded-full text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors shadow-lg shadow-black/20 transform hover:scale-110"><Trash2 size={13} /></button>
                        </div>
                      )}

                      {isMe && (
                        <div className="absolute -bottom-5 right-1 text-[11px] text-white/40 font-medium flex items-center gap-1.5">
                          <CheckCircle2 size={12} className={cn(msg.read ? "text-brand-green" : "text-white/30")} />
                          {msg.read ? 'قرأ' : 'أُرسل'}
                        </div>
                      )}
                    </div>
                  </div>
                )})}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/Messages.tsx', content);
