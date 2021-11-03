import React, { useEffect, useState } from 'react';
import { useDragTarget, color, css, CssValue, t, Filesystem } from '../common';

import { Button } from 'sys.ui.primitives/lib/ui.ref/button/Button';

export type DevFsSampleProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
};

/**
 *
 * SAMPLE
 *    Simple drop target that writes a file to the [Filesystem:IndexedDB].
 *
 */
export const DevFsSample: React.FC<DevFsSampleProps> = (props) => {
  const { bus } = props;

  const [image, setImage] = useState<string | undefined>();
  const name = 'fs.foo';
  const path = 'my-folder/my-image.png';

  const load = async (path: string) => {
    const { store, fs } = await Filesystem.IndexedDb.create({ bus, name });

    const res = await fs.read(path);
    if (!res) {
      return setImage(undefined);
    }

    const blob = new Blob([res.buffer], { type: 'image/png' });
    const url = URL.createObjectURL(blob);

    console.log('url', url);
    setImage(url);

    store.dispose();
  };

  const del = async (path: string) => {
    const { store, fs } = await Filesystem.IndexedDb.create({ bus, name });
    const res = await fs.delete(path);

    store.dispose();
    await load(path);
  };

  const drag = useDragTarget<HTMLDivElement>(async (e) => {
    const file = e.files[0];
    if (!file) return;

    const { store, fs } = await Filesystem.IndexedDb.create({ bus, name });
    const res = await fs.write(path, file.data);

    store.dispose();
    await load(path);
  });

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    load(path);
  }, []); // eslint-disable-line

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      overflow: 'hidden',
      padding: 20,
    }),
    image: {
      base: css({
        Absolute: [100, 50, 50, 50],
        backgroundColor: color.format(1),
        Flex: 'center-center',
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: 'contain',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        border: `solid 1px ${color.format(-0.1)}`,
        boxShadow: `0 0 15px 0 ${color.format(-0.08)}`,
      }),
      over: css({
        PaddingX: 25,
        PaddingY: 8,
        border: `dashed 1px ${color.format(-0.2)}`,
        backgroundColor: color.format(0.7),
      }),
      empty: css({
        opacity: 0.2,
      }),
    },
  };

  const elOver = drag.isDragOver && <div {...styles.image.over}>Drop Image</div>;

  const elEmpty = !drag.isDragOver && !image && (
    <div {...styles.image.empty}>Nothing to display</div>
  );

  const elImage = (
    <div ref={drag.ref} {...styles.image.base}>
      {elOver}
      {elEmpty}
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div>sample path: {path}</div>
      <div>
        <div>
          <Button onClick={() => load(path)}>Load</Button>
        </div>
        <div>
          <Button onClick={() => del(path)}>Delete</Button>
        </div>
      </div>

      {elImage}
    </div>
  );
};

export default DevFsSample;
