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
  input = input || '';
  return input.startsWith('localhost') && !input.includes('.') ? 'http' : 'https';
}
