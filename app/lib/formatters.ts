export function formatStatNumber(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1)}K`;
  }
  return String(n);
}

export function formatBitrate(bitrate: number): string {
  if (!bitrate) return "";
  return `${bitrate} kbps`;
}

export function popularityPercent(votes: number): number {
  return Math.min(
    100,
    Math.round((Math.log10(Math.max(1, votes)) / 4) * 100)
  );
}
