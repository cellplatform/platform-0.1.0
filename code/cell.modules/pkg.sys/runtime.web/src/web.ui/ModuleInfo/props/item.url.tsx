import React from 'react';

import { t, Button, css, copyToClipboard } from '../../common';
import * as m from '../types';
import { Icons } from '../../Icons';

type P = t.PropListItem;

export function toUrl(args: { url: t.ManifestUrlParts }): P {
  const height = 14;
  const styles = {
    base: css({ height, Flex: 'horizontal-center-center' }),
    icon: css({ marginRight: 4 }),
  };

  const data = (
    <Button onClick={() => copyToClipboard(args.url.href)}>
      <div {...styles.base}>
        <Icons.Link size={height} style={styles.icon} />
        <div>manifest</div>
      </div>
    </Button>
  );

  return {
    label: 'source',
    value: { data, clipboard: false },
  };
}
