import React, { useEffect, useRef, useState } from 'react';
import { slug, color, css, time, CssValue, t, Vimeo, PositioningLayers } from '../common';
import { ShellVideo } from './Shell.Video';
import { ShellDiagram } from './Shell.Diagram';

export type ShellProps = {
  bus: t.EventBus<any>;
  isEditable: boolean;
  style?: CssValue;
};

export const Shell: React.FC<ShellProps> = (props) => {
  const { bus, isEditable } = props;

  const Id = {
    ref: useRef(slug()),
    layer: (id: string) => `${Id.ref.current}-${id}`,
  };

  const footerHeight = 200; // TEMP 🐷

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: 0 }),

    body: css({
      // Absolute: 0,
      // height:
    }),
  };

  const body: t.PositioningLayer = {
    id: Id.layer('body'),
    position: { x: 'stretch', y: 'top' },
    render(e) {
      console.log('e', e);
      const styles = {
        base: css({
          flex: 1,
          backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
          height: e.size.height - footerHeight,
        }),
      };
      return <ShellDiagram bus={bus} isEditable={isEditable} style={styles.base} />;
    },
  };

  const video: t.PositioningLayer = {
    id: Id.layer('video'),
    position: { x: 'right', y: 'bottom' },
    render(e) {
      return <ShellVideo bus={bus} isEditable={isEditable} height={footerHeight} />;
    },
  };

  const layers = [body, video];
  return <PositioningLayers style={css(styles.base, props.style)} layers={layers} />;
};
