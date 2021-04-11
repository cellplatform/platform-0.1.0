import React from 'react';

import { Card } from '../../Card';
import { PropList, PropListItem } from '../../PropList';

export type SampleCardProps = {
  id: string;
};

export const SampleCard: React.FC<SampleCardProps> = (props) => {
  const items: PropListItem[] = [
    { label: 'id', value: props.id },
    { label: 'message', value: 'hello' },
  ];

  return (
    <Card padding={[10, 15]} width={{ min: 200 }}>
      <PropList title={'Card'} items={items} />
    </Card>
  );
};
