import React from 'react';

import { CssValue, t } from '../../common';
import { Icons } from '../Icons';
import { Layout } from '../Label/Layout';

export type NetworkLabelProps = {
  id: t.NetworkId;
  isCopyable?: boolean;
  style?: CssValue;
};

export const NetworkLabel: React.FC<NetworkLabelProps> = (props) => {
  const { isCopyable = true } = props;
  const PREDICATE = 'network';
  const id = (props.id || '').trim().replace(/^network\:/, '');
  const uri = `${PREDICATE}:${id || '<id>'}`;

  return (
    <Layout
      style={props.style}
      text={uri}
      isCopyable={isCopyable}
      labelOffset={[0, 0]}
      renderIcon={(e) => {
        return <Icons.Antenna size={22} />;
      }}
    />
  );
};
