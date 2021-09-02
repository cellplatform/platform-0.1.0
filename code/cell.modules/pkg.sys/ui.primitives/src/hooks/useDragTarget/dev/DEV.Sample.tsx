import React, { useState } from 'react';
import { ObjectView } from 'sys.ui.dev';

import { useDragTarget } from '..';
import { color, css, Button, Spinner, t } from './common';
import { upload } from './DEV.Sample.upload';

const toUpload = (file: t.DroppedFile): t.IHttpClientCellFileUpload => {
  const { mimetype, data } = file;
  return { filename: file.path, mimetype, data };
};

const stripBinary = (dropped: t.Dropped) => {
  // NB: The Uint8Array is replaced with a string for display purposes. If left as the
  //     binary object, the UI will hanging, attempting to write it as integers to the DOM.
  const files = dropped.files.map((file) => ({ ...file, data: '<Uint8Array>' }));
  return { ...dropped, files };
};

export const Sample: React.FC = () => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const drag = useDragTarget(rootRef, (e) => console.log('onDropped (optional)', e));

  const { isDragOver, isDropped } = drag;
  const dropped = drag.dropped ? stripBinary(drag.dropped) : undefined;
  const data = { isDragOver, isDropped, dropped };
  const files = (drag.dropped?.files || []).map(toUpload);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const styles = {
    base: css({ Absolute: 0, display: 'flex' }),
    body: {
      base: css({
        Flex: 'vertical-stretch-stretch',
        flex: 1,
        position: 'relative',
        filter: drag.isDragOver ? `blur(1px)` : undefined,
        opacity: drag.isDragOver ? 0.5 : 1,
      }),
      toolbar: {
        base: css({
          Flex: 'horizontal-center-center',
          padding: 10,
          borderBottom: `solid 1px ${color.format(-0.1)}`,
        }),
        divider: css({ width: 30 }),
      },
      main: css({
        flex: 1,
        padding: 20,
        Scroll: true,
      }),
      footer: css({
        Absolute: [null, 0, 0, 0],
        padding: 15,
        borderTop: `solid 1px ${color.format(-0.1)}`,
      }),
    },
    dragOver: css({
      Absolute: 0,
      Flex: 'center-center',
      pointerEvents: 'none',
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

  const elSpacer = <div {...styles.body.toolbar.divider} />;

  const elDragOver = drag.isDragOver && (
    <div {...styles.dragOver}>
      <div>Drop File</div>
    </div>
  );

  const elToolbar = (
    <div {...styles.body.toolbar.base}>
      <Button onClick={() => drag.reset()}>Reset</Button>
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

  const elMain = (
    <div {...styles.body.main}>
      <ObjectView name={'debug'} data={data} expandLevel={10} />
    </div>
  );

  const elFooter = uploadedUrls.length > 0 && (
    <div {...styles.body.footer}>
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
    <div ref={rootRef} {...styles.base}>
      <div {...styles.body.base}>
        {elToolbar}
        {elMain}
        {elFooter}
      </div>
      {elDragOver}
    </div>
  );
};
