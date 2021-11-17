import React from 'react';
import { ObjectView, Test } from 'sys.ui.dev';

import { useModuleTarget } from '..';
import { Button, color, COLORS, css, CssValue, ManifestUrl, t, WebRuntimeBus } from '../../common';
import { ModuleInfo } from '../../ModuleInfo';
import { useManifest } from '../../useManifest';

type Path = string;

export type DevSampleProps = {
  bus: t.EventBus;
  target: string;
  url?: string;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { bus, url, target } = props;

  const manifest = useManifest({ url });
  const remote = useModuleTarget({ bus, target });

  const fireLoad = (manifest: t.ModuleManifest, entry: Path) => {
    if (url) {
      const events = WebRuntimeBus.Events({ bus });
      const module = ManifestUrl.toRemoteImport(url, manifest, entry);
      events.useModule.fire({ target, module });
      events.dispose();
    }
  };

  const fireUnload = () => {
    const events = WebRuntimeBus.Events({ bus });
    events.useModule.fire({ target, module: null });
    events.dispose();
  };

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
      base: css({
        flex: 1,
        position: 'relative',
        Scroll: true,
        padding: 20,
      }),
      moduleInfo: css({}),
    },
    right: {
      base: css({
        position: 'relative',
        flex: 1,
        borderLeft: `solid 1px ${color.alpha(COLORS.MAGENTA, 0.3)}`,
        Flex: 'vertical-stretch-stretch',
      }),
      top: css({
        flex: 2,
        position: 'relative',
        Scroll: true,
        padding: 20,
      }),
      bottom: css({
        borderTop: `solid 1px ${color.alpha(COLORS.MAGENTA, 0.3)}`,
        flex: 1,
        display: 'flex',
      }),
    },
  };

  const name = manifest.isMock ? `manifset (mock)` : 'manifest';

  const elEmpty = manifest.isMock && (
    <div {...styles.empty.base}>
      <div {...styles.empty.body}>Load a manifest</div>
    </div>
  );

  const elBody = !manifest.isMock && (
    <div {...styles.body}>
      <div {...styles.left.base}>
        <ModuleInfo
          url={url}
          manifest={manifest.json}
          maxWidth={280}
          style={styles.left.moduleInfo}
          onExportClick={(e) => {
            console.log('onExportClick', e);
            if (manifest.json) {
              fireLoad(manifest.json, e.entry);
            }
          }}
        />
        <ObjectView name={name} data={manifest.json} style={styles.object} />
      </div>
      <div {...styles.right.base}>
        <div {...styles.right.top}>
          <Button onClick={fireUnload}>Unload</Button>
          <ObjectView name={'remote'} data={remote} style={styles.object} expandLevel={5} />
        </div>
        <div {...styles.right.bottom}>
          <Test.View.Results scroll={true} padding={20} style={{ flex: 1 }} />
        </div>
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
