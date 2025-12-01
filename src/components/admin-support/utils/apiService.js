import { getServerUrl } from '../../../utils/serverUrl';

const API_URL = getServerUrl();

export async function fetchUsers() {
  try {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) throw new Error('no users');
    const data = await res.json();
    return Array.isArray(data)
      ? data.map((u) => String(u.username || '').trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export async function fetchMessages() {
  try {
    const r = await fetch(`${API_URL}/messages`);
    if (r.ok) {
      return await r.json();
    }
    return [];
  } catch (e) {
    void e;
    return [];
  }
}

export async function postMessage(msg) {
  try {
    await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
  } catch (e) {
    void e;
  }
}

export async function markThreadHandled(threadId) {
  try {
    await fetch(`${API_URL}/messages/mark-handled`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thread: threadId }),
    });
  } catch (e) {
    void e;
  }
}

export async function deleteThread(threadId) {
  try {
    const res = await fetch(
      `${API_URL}/messages/thread/${encodeURIComponent(threadId)}`,
      {
        method: 'DELETE',
      }
    );
    return res.ok;
  } catch (e) {
    console.error('Failed to delete thread:', e);
    return false;
  }
}
