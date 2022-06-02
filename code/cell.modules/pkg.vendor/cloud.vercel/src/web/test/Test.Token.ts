/**
 * API token.
 */
export const TestToken = {
  /**
   * Storage location ("key").
   */
  key: 'tmp.dev.token.vercel', // TEMP 🐷 HACK: this is not high enough security long-term to store private-keys.

  /**
   * Read token from storage.
   */
  read() {
    return localStorage.getItem(TestToken.key) ?? '';
  },

  /**
   * Write token to storage.
   */
  write(token: string) {
    localStorage.setItem(TestToken.key, token);
    return token;
  },

  /**
   * HTTP headers.
   */
  get headers() {
    const token = TestToken.read();
    const Authorization = `Bearer ${token}`;
    const headers = { Authorization };
    return headers;
  },
};
