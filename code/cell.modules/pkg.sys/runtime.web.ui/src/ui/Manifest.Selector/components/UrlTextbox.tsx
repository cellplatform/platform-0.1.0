import React from 'react';
import { Textbox } from 'sys.ui.dev/lib/ui/Textbox';

import { Icons } from '../../Icons';
import { Color, COLORS, css, CssValue, t } from '../common';
import { ManifestSelectorLoadHandler, ManifestSelectorUrlChangeHandler } from '../types';

type Url = string;

export type UrlTextboxProps = {
  url: Url;
  error?: string;
  focusOnLoad?: boolean;
  style?: CssValue;
  onChange?: ManifestSelectorUrlChangeHandler;
  onLoadManifest?: ManifestSelectorLoadHandler;
  onKeyDown?: t.ManifestSelectorKeyboardHandler;
  onKeyUp?: t.ManifestSelectorKeyboardHandler;
};

export const UrlTextbox: React.FC<UrlTextboxProps> = (props) => {
  const { url } = props;

  const styles = {
    base: css({ position: 'relative' }),
    textbox: css({ fontSize: 12 }),
    error: css({ marginTop: 4, fontSize: 11, color: COLORS.MAGENTA }),
  };

  const elError = props.error && <div {...styles.error}>{props.error}</div>;

  const onKey = (
    action: t.ManifestSelectorKeyboardArgs['action'],
    e: t.TextInputKeyEvent,
    handler?: t.ManifestSelectorKeyboardHandler,
  ) => {
    const { key, ctrlKey, shiftKey, metaKey, altKey } = e;
    handler?.({
      action,
      key,
      ctrlKey,
      shiftKey,
      metaKey,
      altKey,
      cancel: () => e.preventDefault(),
    });
  };

  const elTextbox = (
    <Textbox
      value={url}
      placeholder={'manifest url'}
      style={styles.textbox}
      spellCheck={false}
      selectOnFocus={true}
      focusOnLoad={props.focusOnLoad}
      onChange={(e) => props.onChange?.({ url: e.to })}
      onKeyDown={(e) => onKey('down', e, props.onKeyDown)}
      onKeyUp={(e) => onKey('up', e, props.onKeyDown)}
      enter={{
        isEnabled: Boolean(url),
        handler: () => props.onLoadManifest?.({ url }),
        icon(e) {
          const el = (
            <div {...css({ Flex: 'horizontal-center-center' })}>
              {url && <Icons.Arrow.Forward size={18} opacity={0.5} style={{ marginRight: 4 }} />}
              <Icons.Antenna size={18} color={url ? COLORS.BLUE : Color.alpha(COLORS.DARK, 0.6)} />
            </div>
          );
          return el;
        },
      }}
    />
  );

  return (
    <div {...css(styles.base)}>
      {elTextbox}
      {elError}
    </div>
  );
};
