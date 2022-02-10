import React from 'react';

import { CssValue, t } from '../../common';
import { Icons } from '../Icons';
import { LabelLayout } from './Layout';

export type PeerLabelProps = {
  id: t.PeerId;
  isCopyable?: boolean;
  style?: CssValue;
};

export const PeerLabel: React.FC<PeerLabelProps> = (props) => {
  const { isCopyable = true } = props;
  const PREDICATE = 'peer';
  const id = (props.id || '').trim().replace(/^peer\:/, '');
  const uri = `${PREDICATE}:${id || '<id>'}`;

  return (
    <LabelLayout
      style={props.style}
      text={uri}
      isCopyable={isCopyable}
      labelOffset={[0, -1]}
      renderIcon={(e) => {
        return <Icons.Face size={22} />;
      }}
    />
  );
};
