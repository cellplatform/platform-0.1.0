import { ObjectView } from 'sys.ui.dev';
import React from 'react';
import { COLORS, color, css, CssValue, t } from '../../common';
import { useManifest } from '../../useManifest';
import { useModule } from '..';
import { ModuleInfo } from '../../ModuleInfo';

export type DevSampleProps = {
  bus: t.EventBus;
  target?: string;
  url?: string;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { bus, url, target } = props;
  const manifest = useManifest({ url });

  // const target = 'foo';
  const remote = useModule({ bus, target });

  console.log('remote', remote);

  // remote.

  // if (manifest.isMock) return null;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', boxSizing: 'border-box', flex: 1, fontSize: 14 }),
    body: css({ Absolute: 0, overflow: 'hidden', Flex: 'horizontal-stretch-stretch' }),
    object: css({ marginTop: 30 }),
    empty: {
      base: css({ Flex: 'center-center', Absolute: 0 }),
      body: css({ color: color.format(-0.3), fontStyle: 'italic', fontSize: 12 }),
    },
    left: {
      base: css({ flex: 1, position: 'relative', Scroll: true, padding: 20 }),
      moduleInfo: css({ marginTop: 30 }),
    },
    right: {
      base: css({
        flex: 1,
        position: 'relative',
        Scroll: true,
        borderLeft: `solid 1px ${color.alpha(COLORS.MAGENTA, 0.3)}`,
        padding: 20,
      }),
    },
  };

  const name = manifest.isMock ? `manifset (mock)` : 'manifest';

  const elUrl = (
    <a href={url} target={'_blank'} rel={'noreferrer'}>
      {url}
    </a>
  );

  const elEmpty = manifest.isMock && (
    <div {...styles.empty.base}>
      <div {...styles.empty.body}>Load a manifest</div>
    </div>
  );

  const elBody = !manifest.isMock && (
    <div {...styles.body}>
      <div {...styles.left.base}>
        {elUrl}
        <ModuleInfo manifest={manifest.json} maxWidth={280} style={styles.left.moduleInfo} />
        <ObjectView name={name} data={manifest.json} style={styles.object} />
      </div>
      <div {...styles.right.base}>
        <ObjectView name={'remote'} data={remote} style={styles.object} expandLevel={2} />
      </div>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elEmpty}
      {elBody}
    </div>
  );
};
