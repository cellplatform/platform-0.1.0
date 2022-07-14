import { EventBus } from '@platform/types';
import { rx } from '@platform/util.value';
import React from 'react';

export type SampleErrorProps = { bus?: EventBus<any> };

export const SampleError: React.FC<SampleErrorProps> = (props) => {
  const bus = props.bus ? rx.bus.instance(props.bus) : '';
  throw new Error(`My Error 🐷 ${bus}`.trim());
};

export default SampleError;
