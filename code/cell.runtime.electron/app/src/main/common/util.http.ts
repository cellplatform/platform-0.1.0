export function isHttp(input: string) {
  input = (input ?? '').trim();
  return ['http://', 'https://'].some((p) => input.startsWith(p));
}

export function toHost(input: string) {
  return isHttp(input) ? new URL(input).host : (input ?? '').trim();
}
