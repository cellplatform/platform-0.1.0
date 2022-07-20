import React, { useEffect, useState } from 'react';

import { Button, css, CssValue, WebRuntime, COLORS, Color, Icons } from './common';

export type DevVersionProps = { style?: CssValue };

export const DevVersion: React.FC<DevVersionProps> = (props) => {
  const href = `${location.origin}/?dev=Sample.App`;
  const isHttps = location.protocol === 'https:';

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
    link: css({ display: 'block' }),
    semver: css({ cursor: 'pointer', opacity: 0.5 }),
    icon: css({ position: 'relative', top: 1, marginLeft: 3 }),
  };

  const Icon = isHttps ? Icons.Lock.Closed : Icons.Lock.Open;
  const elIcon = <Icon color={Color.alpha(COLORS.DARK, 0.5)} size={14} style={styles.icon} />;

  const elSemver = (
    <Button>
      <WebRuntime.UI.ManifestSemver style={styles.semver} fontSize={11} />
    </Button>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <a href={href} target={'_blank'} rel={'noreferrer'} {...styles.link}>
        {elSemver}
        {elIcon}
      </a>
    </div>
  );
};
