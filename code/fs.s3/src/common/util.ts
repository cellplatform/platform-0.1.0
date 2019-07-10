export function formatETag(value?: string) {
  return value ? value.replace(/^\"/, '').replace(/\"$/, '') : undefined;
}
