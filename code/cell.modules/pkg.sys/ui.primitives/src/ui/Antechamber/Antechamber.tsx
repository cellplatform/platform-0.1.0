import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, useResizeObserver } from '../../common';
import { Mask, MaskProps } from './components/Mask';
import { Body } from './components/Body';

type Milliseconds = number;

export type AntechamberProps = {
  isOpen?: boolean;
  backgroundBlur?: number;
  centerTop?: JSX.Element;
  centerBottom?: JSX.Element;
  maskColor?: string | number;
  resize?: t.ResizeObserver | t.UseResizeObserver;
  slideDuration?: Milliseconds;
  style?: CssValue;
  onSize?: (size: t.DomRect) => void;
};

export const Antechamber: React.FC<AntechamberProps> = (props) => {
  const { backgroundBlur = 6, isOpen, centerBottom, centerTop } = props;
  const slideDuration = props.slideDuration ?? 200;
  const bevelHeight = 45;

  const baseRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(baseRef, { root: props.resize, onSize: props.onSize });

  const backdropFilter = `blur(${backgroundBlur}px)`;
  const maskColor = color.format(props.maskColor ?? 0.75);

  const styles = {
    base: css({ position: 'relative', overflow: 'hidden' }),
    notReady: css({ Absolute: 0, backgroundColor: maskColor, backdropFilter }),
    ready: css({ Absolute: 0 }),
  };

  const elNotReady = !size.ready && <div {...styles.notReady} />;

  const toMask = (edge: MaskProps['edge']) => {
    const height = size.rect?.height / 2;
    return (
      <Mask
        edge={edge}
        backgroundColor={maskColor}
        backdropFilter={backdropFilter}
        isOpen={isOpen}
        slideDuration={slideDuration}
        height={height}
        bevelHeight={bevelHeight}
      />
    );
  };

  const elReady = size.ready && (
    <div {...styles.ready}>
      {toMask('top')}
      {toMask('bottom')}
      <Body
        isOpen={isOpen}
        bevelHeight={bevelHeight + 3}
        slideDuration={slideDuration}
        centerBottom={centerBottom}
        centerTop={centerTop}
      />
    </div>
  );

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      {elNotReady}
      {elReady}
    </div>
  );
};
