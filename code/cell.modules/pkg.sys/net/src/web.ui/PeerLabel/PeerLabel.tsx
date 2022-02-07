import React from 'react';

import { COLORS, css, CssValue, t, Text } from '../../common';
import { Icons } from '../Icons';

export type PeerLabelProps = {
  id: t.PeerId;
  isCopyable?: boolean;
  style?: CssValue;
};

export const PeerLabel: React.FC<PeerLabelProps> = (props) => {
  const { isCopyable = true } = props;
  const PREDICATE = 'peer';
  const id = (props.id || '').trim().replace(/^peer\:/, '');
  const uri = `${PREDICATE}:${id}`;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'x-center-start',
      color: COLORS.DARK,
    }),
    icon: css({ marginRight: 6 }),
    label: {
      base: css({
        top: -1,
        position: 'relative',
        fontFamily: 'monospace',
        fontSize: 11,
        fontWeight: 600,
      }),
      predicate: css({ color: COLORS.MAGENTA }),
      value: css({ color: COLORS.CYAN_BLUE }),
    },
  };

  const elLabel = (
    <div>
      <Text.Copy
        onCopy={
          isCopyable
            ? (e) => {
                e.copy(uri);
                e.message('copied', { opacity: 0.3, blur: 2 });
              }
            : undefined
        }
        icon={{
          element: <Text.Copy.Icon size={13} />,
          offset: 3,
          edge: 'E',
        }}
      >
        <span {...styles.label.predicate}>{PREDICATE}:</span>
        <span {...styles.label.value}>{id}</span>
      </Text.Copy>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <Icons.Face style={styles.icon} size={22} />
      <div {...styles.label.base}>{elLabel}</div>
    </div>
  );
};
