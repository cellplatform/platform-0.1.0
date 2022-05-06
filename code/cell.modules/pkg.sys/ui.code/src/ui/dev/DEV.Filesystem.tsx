import React from 'react';
import { Color, COLORS, css, CssValue, t } from '../../common';

import { PathListStateful } from 'sys.fs/lib/ui/PathList';
import { Icons } from '../Icons';

export type DevFilesystemProps = {
  fs: { bus: t.EventBus<any>; id: string };
  style?: CssValue;
};

export const DevFilesystem: React.FC<DevFilesystemProps> = (props) => {
  const state = PathListStateful.useState({ instance: props.fs });

  /**
   * [Render]
   */
  const styles = {
    base: css({
      color: COLORS.DARK,
    }),
    title: css({
      fontFamily: 'monospace',
      fontSize: 12,
      color: Color.alpha(COLORS.DARK, 0.8),
      fontWeight: 500,
      paddingBottom: 3,
      marginBottom: 8,
      borderBottom: `solid 2px ${Color.format(-0.1)}`,
      Flex: 'x-spaceBetween-center',
    }),
  };

  const elTitle = (
    <div {...styles.title}>
      <Icons.HardDrive color={Color.alpha(COLORS.DARK, 0.7)} size={20} />
      <div>{`"${props.fs.id}"`}</div>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elTitle}
      <PathListStateful instance={props.fs} scroll={false} />
    </div>
  );
};
