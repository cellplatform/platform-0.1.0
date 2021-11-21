export function trimHashPrefix(hash: string) {
  const parts = (hash || '').split('-');
  return parts.length === 2 ? parts[1] : parts[0];
}
