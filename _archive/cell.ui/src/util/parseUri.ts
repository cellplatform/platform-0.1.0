import { Uri } from '../common';

export function parseClipboardUri(input: string) {
  input = (input || '').trim();

  let text = stripQuotes(input);
  let uri = '';
  let cell = '';
  let host = '';
  let ns = '';
  let ok = true;

  if (input.startsWith('http:') || input.startsWith('http:')) {
    text = stripHttp(text);
    host = text.substring(0, text.indexOf('/'));
    text = text.substring(host.length + 1);
  }

  if (text.indexOf('?') > -1) {
    text = text.substring(0, text.indexOf('?'));
  }

  if (text.indexOf('/') > -1) {
    text = text.substring(0, text.indexOf('/'));
  }

  if (!text.includes(':')) {
    ns = text;
    uri = `ns:${text}`;
  } else {
    const parsed = Uri.parse(text);
    if (!parsed.ok) {
      ok = false;
    } else {
      uri = text;
      ns = Uri.toNs(text).id;
      cell = text.startsWith('cell:') ? text : '';
    }
  }

  const res = { ok, host, uri, ns, cell, input };
  return res;
}

function stripHttp(text: string) {
  return text
    .replace(/^http\:/, '')
    .replace(/^https\:/, '')
    .replace(/\/\//, '');
}

function stripQuotes(text: string) {
  return text.replace(/^\"/, '').replace(/\"$/, '').replace(/^\'/, '').replace(/\'$/, '');
}
