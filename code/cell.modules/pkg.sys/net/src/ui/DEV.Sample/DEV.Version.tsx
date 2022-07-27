import React, { useEffect, useState } from 'react';

import { Color, COLORS, css, CssValue, Icons, t, time, WebRuntime } from './common';

export type DevVersionProps = { style?: CssValue };

export const DevVersion: React.FC<DevVersionProps> = (props) => {
  const [clicked, setClicked] = useState(false);
  const [manifest, setManifest] = useState<t.ModuleManifest | undefined>();
  const [over, setOver] = useState(false);
  const isSecure = window.isSecureContext;

  /**
   * [Lifecycle]
   */

  useEffect(() => {
    const msecs = 3000;
    const timer = time.delay(msecs, () => setClicked(false));
    return () => timer.cancel();
  }, [clicked]);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      pointerEvents: 'auto',
      color: COLORS.DARK,
      Flex: 'x-center-center',
    }),
    semver: css({ opacity: 0.5 }),
    icon: css({ position: 'relative', top: 1, marginLeft: 3 }),
  };

  const Icon = isSecure ? Icons.Lock.Closed : Icons.Lock.Open;
  const elIcon = (
    <div {...styles.icon}>
      <Icon color={Color.alpha(COLORS.DARK, 0.5)} size={14} />
    </div>
  );

  const prefix = clicked && manifest ? toInfoText(manifest, isSecure) : undefined;

  const elSemver = (
    <WebRuntime.UI.ManifestSemver
      style={styles.semver}
      fontSize={11}
      tooltip={''}
      prefix={prefix}
      version={prefix ? '' : undefined}
      onLoaded={(e) => setManifest(e.json)}
    />
  );

  return (
    <div
      {...css(styles.base, props.style)}
      onMouseDown={() => setClicked(true)}
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
    >
      {elSemver}
      {elIcon}
    </div>
  );
};

/**
 * Helpers
 */

function toInfoText(manifest: t.ModuleManifest, isSecure: boolean) {
  const secure = isSecure ? `context is secure` : 'context is insecure';
  return `${manifest.module.namespace} (${secure})`;
}
