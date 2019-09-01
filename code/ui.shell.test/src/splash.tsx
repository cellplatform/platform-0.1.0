import * as React from 'react';
import { shell, is, css, COLORS } from './common';

/**
 * Factory for JSX Elements needed by the splash screen.
 */
export const factory: shell.SplashFactory = args => {
  const { theme, type } = args;
  const filename = theme === 'LIGHT' ? 'acme-dark' : 'acme-light';
  const logo = [`/images/logo/${filename}.png`, `/images/logo/${filename}@2x.png`, 169, 32];

  if (type === 'TOP:LEFT') {
    const text = `ui.shell (sample)`;
    return renderText({ text, theme });
  }

  if (type === 'TOP:RIGHT') {
    const size = attr('html', 'data-size');
    const version = attr('html', 'data-version');
    const text = size && version ? `version ${version}, size ${size}` : '';
    return renderText({ text, theme });
  }

  if (type === 'BOTTOM:LEFT') {
    const text = `© ${new Date().getFullYear()}, Acme Inc.`;
    return renderText({ text, theme });
  }

  if (type === 'BOTTOM:RIGHT') {
    const style = css({ Image: logo, marginRight: 25, marginBottom: 18 });
    return <div {...style} />;
  }

  return undefined;
};

/**
 * [Helpers]
 */
const attr = (tag: string, key: string) => {
  return is.browser ? document.getElementsByTagName(tag)[0].getAttribute(key) : '';
};

const renderText = (args: { text: string; theme: shell.ShellTheme; margin?: string }) => {
  const style = css({
    margin: args.margin || 10,
    fontSize: 14,
    opacity: 0.4,
    color: args.theme === 'DARK' ? COLORS.WHITE : COLORS.DARK,
    userSelect: 'none',
  });
  return <div {...style}>{args.text}</div>;
};
