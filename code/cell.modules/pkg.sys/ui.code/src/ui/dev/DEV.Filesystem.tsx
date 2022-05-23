import React from 'react';
import { Color, COLORS, css, CssValue, t } from '../../common';

import { Filesystem } from 'sys.fs/lib/web/ui';
import { Icons } from '../Icons';

export type DevFilesystemProps = {
  instance: t.FsViewInstance;
  style?: CssValue;
};

export const DevFilesystem: React.FC<DevFilesystemProps> = (props) => {
  const { instance } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ color: COLORS.DARK }),
    title: css({
      fontSize: 12,
      fontFamily: 'monospace',
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
      <Icons.HardDrive color={COLORS.DARK} size={20} />
      <div>{`"${instance.fs}"`}</div>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elTitle}
      <Filesystem.PathList.Stateful
        instance={instance}
        scroll={false}
        droppable={true}
        selectable={true}
      />
    </div>
  );
};
