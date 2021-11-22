import React from 'react';

import { t, Button, css, HashChip } from '../../common';
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
      icon: css({ marginRight: 4 }),
    },
    hash: css({ marginLeft: 4 }),
  };

  const elManifestButton = (
    <Button>
      <div {...styles.button.base}>
        <Icons.Link size={height} style={styles.button.icon} />
        <div>manifest</div>
      </div>
    </Button>
  );

  const elChip = hash && <HashChip text={hash} style={styles.hash} />;

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
