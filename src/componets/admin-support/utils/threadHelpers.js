export function computeThreads(messages) {
  const map = new Map();
  messages.forEach((m) => {
    const key = m.thread || (m.from !== 'admin' ? m.from : m.to || 'unknown');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(m);
  });

  const out = [];
  map.forEach((msgs, id) => {
    const sorted = msgs.slice().sort((a, b) => (a.time > b.time ? 1 : -1));
    const userMsgs = sorted.filter((x) => x.from !== 'admin');
    if (!userMsgs.length) return;

    const lastUser = userMsgs[userMsgs.length - 1];
    const firstUser = userMsgs[0];
    const unread = userMsgs.filter((x) => !x.handled).length;

    out.push({
      id,
      lastUserText: lastUser.text,
      lastUserTime: lastUser.time,
      firstUser,
      unread,
      total: sorted.length,
      messages: sorted,
    });
  });

  return out.sort((a, b) => (a.lastUserTime < b.lastUserTime ? 1 : -1));
}

export function markMessagesAsHandled(messages, threadId) {
  return messages.map((x) => {
    try {
      const target = String(threadId || '').toLowerCase();
      const mkey = String(x.thread || x.from || '').toLowerCase();
      return mkey === target && x.from !== 'admin'
        ? { ...x, handled: true }
        : x;
    } catch {
      return x;
    }
  });
}
