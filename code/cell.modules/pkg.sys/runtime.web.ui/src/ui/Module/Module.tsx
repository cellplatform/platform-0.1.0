import React from 'react';

import { css, CssValue, t } from '../../common';
import { useModule } from '../useModule';

type Id = string;

export type ModuleProps = {
  instance: { bus: t.EventBus<any>; id?: Id };
  url?: t.ManifestUrl;
  style?: CssValue;
};

export const Module: React.FC<ModuleProps> = (props) => {
  const { instance, url } = props;

  const remote = useModule({ instance, url });
  const Component = remote.module?.default;

  /**
   * TODO 🐷
   * - put an [React Event Boundary] around this here.
   * - <Spinner> (optional)
   * - <Empty> (optional)
   */

  /**
   * Render
   */
  const styles = {
    base: css({ position: 'relative', display: 'flex' }),
    body: css({ flex: 1 }),
  };

  const elBody = Component && <Component bus={instance.bus} />;

  return <div {...css(styles.base, props.style)}>{elBody}</div>;
};
