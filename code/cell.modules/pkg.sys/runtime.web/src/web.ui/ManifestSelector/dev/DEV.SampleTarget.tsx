import React from 'react';

import { useModule } from '../../hooks';
import { css, t } from '../common';

export type DevSampleTargetProps = { bus: t.EventBus; target: string };

/**
 * Sample UI for the [useModuleTarget] hook.
 */
export const DevSampleTarget: React.FC<DevSampleTargetProps> = (props) => {
  const { bus, target } = props;
  const remote = useModule({ bus, target });

  console.log('target', target);
  console.log('useModuleTarget (remote)', remote);

  const styles = { base: css({ position: 'relative', flex: 1 }) };
  const Component = remote.module?.default;
  return <div {...styles.base}>{Component && <Component bus={props.bus} />}</div>;
};
