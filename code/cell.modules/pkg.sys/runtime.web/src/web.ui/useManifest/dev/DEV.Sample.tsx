import { ObjectView } from 'sys.ui.dev';
import React from 'react';
import { COLORS, color, css, CssValue, t } from '../../common';
import { useManifest } from '..';
import { ModuleInfo } from '../../ModuleInfo';

export type DevSampleProps = {
  url?: string;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { url } = props;
  const manifest = useManifest({ url });

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      Flex: 'horizontal-stretch-stretch',
      flex: 1,
      fontSize: 14,
    }),
    left: {
      base: css({
        position: 'relative',
        Flex: 'center-center',
        flex: 1,
      }),
      header: css({
        Absolute: [0, 0, null, 0],
        padding: 8,
      }),
    },
    right: {
      base: css({
        position: 'relative',
        Scroll: true,
        flex: 1,
        borderLeft: `solid 1px ${color.alpha(COLORS.MAGENTA, 0.3)}`,
        padding: 20,
      }),
    },
  };

  const name = manifest.isMock ? `manifset (mock)` : 'manifest';

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.left.base}>
        <div {...styles.left.header}>
          <a href={url} target={'_blank'} rel={'noreferrer'}>
            {url}
          </a>
        </div>
        <ModuleInfo manifest={manifest.json} />
      </div>
      <div {...styles.right.base}>
        <ObjectView name={name} data={manifest.json} />
      </div>
    </div>
  );
};
