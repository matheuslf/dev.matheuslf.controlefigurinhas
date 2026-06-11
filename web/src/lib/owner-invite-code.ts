const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOwnerInviteCode(): string {
  let raw = "";
  for (let i = 0; i < 8; i++) {
    raw += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return raw;
}

export function normalizeOwnerInviteCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatOwnerInviteCode(code: string): string {
  const normalized = normalizeOwnerInviteCode(code);
  if (normalized.length <= 4) return normalized;
  return `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}`;
}

export function isValidOwnerInviteCode(input: string): boolean {
  return normalizeOwnerInviteCode(input).length === 8;
}
