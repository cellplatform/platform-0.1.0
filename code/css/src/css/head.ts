import { t, is } from '../common';

export function init(): t.ICssHead {
  /**
   * Adds an `@import` stylesheet reference to the <head>
   * if it does not already exist.
   */
  const importStylesheet: t.ImportStylesheet = (url: string) => {
    if (!is.browser) {
      return res;
    }
    if (exists('style', url)) {
      return res; // NB: Only add to the document once.
    }
    // const head = document.head || document.getElementsByTagName('head')[0];
    const head = document.head;
    const style = document.createElement('style');
    style.type = 'text/css';
    const css = `@import url('${url}')`;
    style.dataset.url = url;
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);

    // Finish up.
    return res;
  };

  const res: t.ICssHead = {
    importStylesheet,
  };

  return res;
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
