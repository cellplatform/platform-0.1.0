import React from 'react';
import { Textbox } from 'sys.ui.dev/lib/ui/Textbox';

import { Icons } from '../../Icons';
import { color, COLORS, css, CssValue } from '../common';
import { LoadManifestHandler, ManifestUrlChangeHandler } from '../types';

type Url = string;

export type ManifestSelectorTextboxProps = {
  url: Url;
  error?: string;
  style?: CssValue;
  onChange?: ManifestUrlChangeHandler;
  onLoadManifest?: LoadManifestHandler;
};

export const ManifestSelectorTextbox: React.FC<ManifestSelectorTextboxProps> = (props) => {
  const { url } = props;

  const styles = {
    base: css({ position: 'relative' }),
    textbox: css({ fontSize: 12 }),
    error: css({ marginTop: 4, fontSize: 11, color: COLORS.MAGENTA }),
  };

  const elError = props.error && <div {...styles.error}>{props.error}</div>;

  const elTextbox = (
    <Textbox
      value={url}
      placeholder={'manifest url'}
      onChange={(e) => props.onChange?.({ url: e.to })}
      style={styles.textbox}
      spellCheck={false}
      selectOnFocus={true}
      enter={{
        isEnabled: Boolean(url),
        handler: () => props.onLoadManifest?.({ url }),
        icon(e) {
          const el = (
            <div {...css({ Flex: 'horizontal-center-center' })}>
              {url && <Icons.Arrow.Forward size={18} opacity={0.5} style={{ marginRight: 4 }} />}
              <Icons.Antenna size={18} color={url ? COLORS.BLUE : color.alpha(COLORS.DARK, 0.6)} />
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
