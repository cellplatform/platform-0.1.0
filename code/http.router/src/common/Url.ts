/**
 * Helpers for working with URLs.
 */
export const Url = {
  toPath(input?: string) {
    let url = input || '';
    if (!Url.isHttp(url)) url = `https://domain.com/${url.replace(/^\/*/, '')}`;
    return new URL(url).pathname;
  },

  isHttp(input?: string) {
    const url = (input || '').trim();
    return url?.startsWith('https:') || url?.startsWith('http:');
  },
};
