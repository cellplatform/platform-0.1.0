import React, { useEffect, useRef, useState } from 'react';
import { ObjectView } from 'sys.ui.dev';

import { Card, css, CssValue, PropListItem, t, time } from './common';

export type DataConnectionProps = {
  connection: t.PeerConnectionDataStatus;
  isLast?: boolean;
  style?: CssValue;
};

export const DataConnection: React.FC<DataConnectionProps> = (props) => {
  const { connection } = props;
  const marginBottom = props.isLast ? 20 : null;
  const id = connection.id.remote;

  const styles = {
    base: css({
      fontSize: 14,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <Card key={id} padding={[15, 20]} margin={[null, null, marginBottom, null]}>
        <div>connection:</div>
        <div>{id}</div>
        <ObjectView data={connection} />
      </Card>
    </div>
  );
};
