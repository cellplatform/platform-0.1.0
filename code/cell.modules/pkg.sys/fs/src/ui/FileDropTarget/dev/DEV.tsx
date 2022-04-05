import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { FileDropTargetStateful, FileDropTargetStatefulProps } from '..';
import { PathListStateful } from '../../PathList';
import { t, rx, Filesystem, Icons, css } from '../common';

import { PositioningLayout } from 'sys.ui.primitives/lib/ui/PositioningLayout';
import { PositioningLayer } from 'sys.ui.primitives/lib/types';
import { DevOuter } from './DEV.Outer';

type FilesystemId = string;

type Ctx = {
  bus: t.EventBus;
  fs: t.Fs;
  fsid: FilesystemId;
  props: FileDropTargetStatefulProps;
};

const ROOT_DIR = 'my-root';

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.FileDropTarget')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();

    const id = 'dev.fs';
    Filesystem.create({ bus, id: id });
    const fs = Filesystem.Events({ bus, id: id }).fs();

    const ctx: Ctx = {
      bus,
      fs,
      fsid: id,
      props: { bus, fs: id, dir: 'my-root' },
    };
    return ctx;
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('use sample sub-dir', (e) => {
      if (e.changing) e.ctx.props.dir = e.changing.next ? ROOT_DIR : undefined;
      e.boolean.current = Boolean(e.ctx.props.dir);
    });

    e.hr();
  })

  .items((e) => {
    e.title(`Filesystem`);

    e.button('delete: all (reset)', async (e) => {
      const fs = e.ctx.fs;
      const files = (await fs.manifest()).files;
      await Promise.all(files.map((file) => fs.delete(file.path)));
    });

    e.hr();
  })

  .subject((e) => {
    const bus = e.ctx.bus;

    const styles = {
      topLeft: {
        base: css({ Flex: 'horizontal-center-center' }),
        icon: css({ marginRight: 6 }),
      },
    };

    const topLeft = (
      <div {...styles.topLeft.base}>
        <Icons.LegoBlock style={styles.topLeft.icon} size={14} />
        {'Composition: <PathList>  ➡︎  <FileDropTarget>'}
      </div>
    );

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft,
          topRight: `Filesystem: "${e.ctx.fsid}"`,
        },
        position: [150, 80, 150, 80],
        cropmarks: -0.2,
      },
    });

    const LEFT_WIDTH = 400;

    const pathsLayer: PositioningLayer = {
      id: 'PathList',
      position: { x: 'left', y: 'stretch' },
      render(args) {
        return (
          <DevOuter>
            <PathListStateful
              bus={e.ctx.bus}
              id={e.ctx.fsid}
              style={{ flex: 1, width: LEFT_WIDTH }}
              scroll={true}
              padding={[10, 15]}
            />
          </DevOuter>
        );
      },
    };

    const dropLayer: PositioningLayer = {
      id: 'FileDropTarget',
      position: { x: 'stretch', y: 'stretch' },
      render(args) {
        return (
          <DevOuter style={{ marginLeft: LEFT_WIDTH + 50, flex: 1 }}>
            <FileDropTargetStateful {...e.ctx.props} style={{ flex: 1 }} />
          </DevOuter>
        );
      },
    };

    e.render(
      <PositioningLayout
        layers={[dropLayer, pathsLayer]}
        childPointerEvents={'none'}
        style={{ flex: 1 }}
      />,
    );
  });

export default actions;
