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
  const Component = remote.module?.default;

  /**
   * Render
   */
  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
    }),
  };

  const el = Component && <Component bus={props.bus} />;
  return <div {...styles.base}>{el}</div>;
};
