export function isOK(status: number) {
  return status.toString()[0] === '2';
}

export function trimSlashes(input: string) {
  return (input || '')
    .trim()
    .replace(/^\/*/, '')
    .replace(/\/*$/, '')
    .trim();
}
