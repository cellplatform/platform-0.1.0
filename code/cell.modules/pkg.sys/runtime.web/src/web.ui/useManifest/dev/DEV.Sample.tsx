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
    base: css({ position: 'relative', boxSizing: 'border-box', flex: 1, fontSize: 14 }),
    body: css({ Absolute: 0, overflow: 'hidden', Flex: 'horizontal-stretch-stretch' }),
    object: css({ marginTop: 20 }),
    left: {
      base: css({ position: 'relative', padding: 20, flex: 1 }),
      footer: css({ Absolute: [null, 0, 0, 0], padding: 8 }),
    },
    right: {
      base: css({
        flex: 1,
        position: 'relative',
        borderLeft: `solid 1px ${color.alpha(COLORS.MAGENTA, 0.3)}`,
        overflow: 'hidden',
      }),
      body: css({ Absolute: 0, Scroll: true, padding: 20 }),
    },
  };

  const name = {
    manifest: manifest.isMock ? `manifset (mock)` : 'manifest',
  };

  const elUrl = (
    <a href={url} target={'_blank'} rel={'noreferrer'}>
      {url}
    </a>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <div {...styles.left.base}>
          <div {...styles.left.footer}>{elUrl}</div>
          <ModuleInfo manifest={manifest.json} maxWidth={280} />
        </div>
        <div {...styles.right.base}>
          <div {...styles.right.body}>
            <ObjectView name={name.manifest} data={manifest.json} style={styles.object} />
            <ObjectView name={'url'} data={manifest.url} style={styles.object} />
          </div>
        </div>
      </div>
    </div>
  );
};
