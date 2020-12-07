import { t, R, value } from '../common';

export function toPort(input: string): number | undefined {
  const text = R.pipe(stripHttp, stripSlash)(input || '').split(':')[1];
  return text === undefined ? undefined : value.toNumber(text);
}

export function stripHttp(input: string) {
  return (input || '')
    .trim()
    .replace(/^http\:\/\//, '')
    .replace(/^https\:\/\//, '');
}

export function stripPort(input: string) {
  return (input || '').replace(/\:\d*$/, '');
}

export function stripSlash(input: string) {
  return (input || '').replace(/^\/*/, '').replace(/\/*$/, '');
}

export function toProtocol(input: string): t.HttpProtocol {
  input = (input || '').trim();

  if (input.startsWith('localhost') && !input.includes('.')) {
    return 'http';
  }

  if (isInternalIP(input)) {
    return 'http';
  }

  return 'https';
}

export function isInternalIP(input: string) {
  return stripHttp(input).startsWith('192.168.');
}

export function isLocal(input: string) {
  if (isInternalIP(input)) {
    return true;
  }

  const host = stripHttp(input).split('/')[0] || '';
  if (host === 'localhost' || host.startsWith('localhost:')) {
    return true;
  }

  return false;
}
