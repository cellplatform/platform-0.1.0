import React, { useState } from 'react';
import { ObjectView } from 'sys.ui.dev';

import { useDragTarget, Dropped } from '.';
import { color, css, HttpClient, t } from '../../common';
import { Button } from '../../components.ref/button/Button';

export const Sample: React.FC = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const dragTarget = useDragTarget(ref);

  const styles = {
    base: css({
      Absolute: 0,
      padding: 30,
    }),
    toolbar: {
      base: css({
        Flex: 'horizontal-center-center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottom: `solid 1px ${color.format(-0.1)}`,
      }),
      divider: css({ width: 30 }),
    },
    dragOver: css({
      Absolute: 0,
      Flex: 'center-center',
      pointerEvents: 'none',
    }),
  };

  const handleUpload = () => {
    const { dropped } = dragTarget;
    // setRedraw((prev) => prev/ + 1);
    // console.log('files', files);
    console.log('dropped', dropped);
  };

  const elSpacer = <div {...styles.toolbar.divider} />;

  const elDragOver = dragTarget.isDragOver && (
    <div {...styles.dragOver}>
      <div>Drop File</div>
    </div>
  );

  const elToolbar = (
    <div {...styles.toolbar.base}>
      <Button onClick={() => dragTarget.reset()}>Reset</Button>
      {elSpacer}
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );

  const { isDragOver, isDropped, dropped } = dragTarget;
  const data = { isDragOver, isDropped, dropped };

  console.log('dropped >>', dropped);

  return (
    <div ref={ref} {...styles.base}>
      {elToolbar}
      <ObjectView name={'debug'} data={data} expandLevel={10} />
      {elDragOver}
    </div>
  );
};
