import { is } from '../common';

/**
 * Adds an `@import` stylesheet reference to the <head>
 * if it does not already exist.
 */
export function importStylesheet(url: string) {
  if (!is.browser) {
    return;
  }
  if (exists('style', url)) {
    return; // NB: Only add to the document once.
  }
  // const head = document.head || document.getElementsByTagName('head')[0];
  const head = document.head;
  const style = document.createElement('style');
  style.type = 'text/css';
  const css = `@import url('${url}')`;
  style.dataset.url = url;
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);
}

/**
 * [Helpers]
 */
function exists(tag: 'style', url: string) {
  return is.browser ? Boolean(findByUrl(tag, url)) : false;
}

function findByUrl(tag: 'style', url: string) {
  if (is.browser) {
    const items = Array.from(document.getElementsByTagName(tag));
    return items.find(style => style.dataset.url === url);
  } else {
    return undefined;
  }
}
