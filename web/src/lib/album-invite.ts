export type AlbumInviteRole = "member";

export function buildAlbumInviteUrl(
  token: string,
  _role: AlbumInviteRole = "member",
  base?: string,
): string {
  const origin =
    base ??
    (typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_URL ?? ""));

  const url = `${origin.replace(/\/$/, "")}/join/${token}`;
  return url;
}
