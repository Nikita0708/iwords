const OWNER_USER_ID = process.env.OWNER_USER_ID || '';
const VIEWER_IDS = (process.env.VIEWER_IDS || '').split(',').map((id) => id.trim()).filter(Boolean);

export function resolveReadUserId(requestingUserId: string): string {
  if (OWNER_USER_ID && VIEWER_IDS.includes(requestingUserId)) {
    return OWNER_USER_ID;
  }
  return requestingUserId;
}
