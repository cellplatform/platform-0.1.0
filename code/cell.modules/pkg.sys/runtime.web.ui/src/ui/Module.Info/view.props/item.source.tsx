import React from 'react';

import { t, Button, css, Chip, DEFAULT } from '../common';
import { Icons } from '../../Icons';

type P = t.PropListItem;

export function toSourceUrl(args: { href: string; hash?: string }): P {
  const { href, hash } = args;

  const height = 14;
  const styles = {
    base: css({
      height,
      position: 'relative',
      Flex: 'horizontal-center-center',
      boxSizing: 'border-box',
    }),
    button: {
      base: css({ height, Flex: 'horizontal-center-center' }),
      icon: css({
        marginRight: hash ? 0 : 4,
      }),
    },
    hash: css({ marginLeft: 4 }),
  };

  const elManifestButton = (
    <Button>
      <div {...styles.button.base}>
        <Icons.Link size={height} style={styles.button.icon} />
        {!hash && <div>manifest</div>}
      </div>
    </Button>
  );

  const elChip = hash && (
    <Chip.Hash text={hash} icon={false} style={styles.hash} length={DEFAULT.HASH_CHIP_LENGTH} />
  );

  const data = (
    <div {...styles.base}>
      {elManifestButton}
      {elChip}
    </div>
  );

  const clipboard = () => {
    if (!hash) return href;
    return `${href}?#${hash}`;
  };

  return {
    label: 'source',
    value: { data, clipboard },
    tooltip: href,
  };
}
