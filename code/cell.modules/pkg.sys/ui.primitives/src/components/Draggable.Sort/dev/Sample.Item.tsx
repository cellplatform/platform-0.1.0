/* eslint-disable */
import { Card } from '../../Card';

import React, { forwardRef } from 'react';

export const Item = forwardRef<any, any>(({ id, ...props }, ref) => {
  return (
    <div {...props} ref={ref}>
      <Card padding={15} margin={5}>
        hello
      </Card>
    </div>
  );
});

/* eslint-enable */
