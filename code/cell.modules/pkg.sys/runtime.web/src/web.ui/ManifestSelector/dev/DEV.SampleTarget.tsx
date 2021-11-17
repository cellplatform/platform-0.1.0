import React from 'react';

import { useModuleTarget } from '../../useModuleTarget';
import { css, t } from '../common';

export type DevSampleTargetProps = { bus: t.EventBus; target: string };

/**
 * Sample UI for the [useModule] hook.
 */
export const DevSampleTarget: React.FC<DevSampleTargetProps> = (props) => {
  const { bus, target } = props;
  const remote = useModuleTarget({ bus, target });

  console.log('target', target);
  console.log('useModule (remote)', remote);

  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
    }),
  };
  const Component = remote.module?.default;
  return <div {...styles.base}>{Component && <Component bus={props.bus} />}</div>;
};
