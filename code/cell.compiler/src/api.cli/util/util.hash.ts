import crypto from 'crypto';

export function toHash(text: string) {
  return text.length === 0 ? '' : crypto.createHash('sha1').update(text).digest('hex');
}
