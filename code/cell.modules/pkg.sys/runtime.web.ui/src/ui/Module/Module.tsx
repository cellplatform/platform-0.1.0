import React from 'react';

import { css, CssValue, t } from '../../common';
import { useModule } from '../useModule';

type InstanceId = string;

export type ModuleProps = {
  bus: t.EventBus;
  url?: t.ManifestUrl;
  id?: InstanceId;
  style?: CssValue;
};

export const Module: React.FC<ModuleProps> = (props) => {
  const { bus, url, id } = props;

  const remote = useModule({ bus, id, url });
  const Component = remote.module?.default;
  // const isLoading = remote.loading;

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

  const elBody = Component && <Component bus={bus} />;

  return <div {...css(styles.base, props.style)}>{elBody}</div>;
};
