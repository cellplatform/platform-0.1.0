import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { DevHarness } from '../Dev.Harness';
import { Module } from '../ui/Module';
import { css, rx, Color, COLORS } from '../common';

const bus = rx.bus();
const instance = { bus };
const url = new URL(location.href);

const query = () => {
  const q = url.searchParams;
  if (q.has('dev')) return q;

  if (q.has('d')) {
    q.set('dev', q.get('d') || '');
    q.delete('d');
    window.history.pushState({}, '', url);
  }

  return q;
};

const isDev = query().has('dev');
const entry = url.searchParams.get('entry') ?? 'net.sys';
const href = Module.App.parseUrl('https://libs.db.team', { entry }).href;

const styles = {
  app: css({
    Absolute: 0,
    backgroundColor: Color.format(-0.06),
  }),
};

const elDev = isDev && <DevHarness />;
const elApp = !isDev && <Module.App instance={instance} href={href} style={styles.app} />;
const el = (isDev ? elDev : elApp) as JSX.Element;

ReactDOM.render(el, document.getElementById('root'));

if (isDev) {
  document.title = `${document.title} (dev)`;
}
