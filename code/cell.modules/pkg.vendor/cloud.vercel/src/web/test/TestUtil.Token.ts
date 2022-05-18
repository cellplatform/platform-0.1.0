import { rx, t, Filesystem, Http } from '../common';

export const Token = {
  key: 'tmp.dev.token.vercel', // TEMP 🐷 HACK: this is not high enough security long-term to store private-keys.
  read() {
    return localStorage.getItem(Token.key) ?? '';
  },
  write(token: string) {
    localStorage.setItem(Token.key, token);
    return token;
  },
  get headers() {
    const token = Token.read();
    const Authorization = `Bearer ${token}`;
    const headers = { Authorization };
    return headers;
  },
};
