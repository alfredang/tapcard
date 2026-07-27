/**
 * Deterministic avatar URLs from DiceBear's HTTP API.
 *
 * We use the `lorelei` and `notionists` styles, both licensed CC0 1.0
 * (public domain), so no attribution is required for commercial use.
 * See https://www.dicebear.com/licenses/
 *
 * The same seed always yields the same face, so demo personas stay stable
 * across re-seeds and screenshots.
 */

const API = "https://api.dicebear.com/10.x";

export type AvatarStyle = "lorelei" | "notionists";

export function avatarUrl(
  seed: string,
  { style = "lorelei", size = 160 }: { style?: AvatarStyle; size?: number } = {},
): string {
  const params = new URLSearchParams({ seed, size: String(size), radius: "50" });
  // backgroundColor must be repeated params, not one comma-joined value, or the
  // API rejects the request with a 400.
  for (const c of ["ede9fe", "fce7f3", "ccfbf1", "fef3c7"]) {
    params.append("backgroundColor", c);
  }
  return `${API}/${style}/svg?${params.toString()}`;
}

/** Initials fallback for when a remote avatar cannot load. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
