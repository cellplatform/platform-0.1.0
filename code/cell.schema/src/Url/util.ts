import { t, R, value } from '../common';

export function toPort(input: string): number | undefined {
  const text = R.pipe(stripHttp, stripSlash)(input || '').split(':')[1];
  return text === undefined ? undefined : value.toNumber(text);
}

export function stripHttp(input: string) {
  return (input || '').replace(/^http\:\/\//, '').replace(/^https\:\/\//, '');
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
  input = (input || '').trim();
  return input.startsWith('192.168.');
}
