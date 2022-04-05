import React from 'react';

import { Card } from '../../Card';
import { PropList } from '../../PropList';
import { t } from './DEV.common';

export type SampleCardProps = {
  id: string;
  isTop: boolean;
};

export const SampleCard: React.FC<SampleCardProps> = (props) => {
  const items: t.PropListItem[] = [
    { label: 'id', value: props.id },
    { label: 'message', value: 'hello' },
  ];

  return (
    <Card padding={[10, 15]} width={{ min: 250 }} shadow={props.isTop}>
      {props.isTop && <PropList title={'Card'} items={items} />}
    </Card>
  );
};
