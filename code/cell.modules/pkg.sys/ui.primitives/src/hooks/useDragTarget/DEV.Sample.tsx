import React, { useState } from 'react';
import { ObjectView } from 'sys.ui.dev';

import { useDragTarget } from '.';
import { color, css } from '../../common';
import { Button } from '../../components.ref/button/Button';
import { Spinner } from '../../components.ref/spinner/Spinner';
import { upload } from './DEV.Sample.upload';

export const Sample: React.FC = () => {
  const ref = React.useRef<HTMLDivElement>(null);

  const dragTarget = useDragTarget(ref);
  const { isDragOver, isDropped, dropped } = dragTarget;
  const data = { isDragOver, isDropped, dropped };
  const files = dragTarget.dropped?.files || [];

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

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
    footer: css({
      Absolute: [null, 0, 0, 0],
      padding: 15,
      borderTop: `solid 1px ${color.format(-0.1)}`,
    }),
    button: css({
      Flex: 'horizontal-center-center',
    }),
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadedUrls(await upload(files));
    setIsUploading(false);
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
      <div {...styles.button}>
        <Button
          isEnabled={files.length > 0}
          onClick={handleUpload}
          label={'Upload'}
          style={{ marginRight: 5 }}
        />
        {isUploading && <Spinner size={18} />}
      </div>
    </div>
  );

  const elFooter = uploadedUrls.length > 0 && (
    <div {...styles.footer}>
      {uploadedUrls.map((url, i) => {
        return (
          <a href={url} key={i} target={'_blank'} rel={'noreferrer'}>
            {uploadedUrls}
          </a>
        );
      })}
    </div>
  );

  return (
    <div ref={ref} {...styles.base}>
      {elToolbar}
      <ObjectView name={'debug'} data={data} expandLevel={10} />
      {elDragOver}
      {elFooter}
    </div>
  );
};
