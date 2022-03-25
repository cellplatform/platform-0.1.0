import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, useResizeObserver } from '../../common';
import { Mask, MaskProps } from './components/Mask';
import { Body } from './components/Body';

type Milliseconds = number;

export type AntechamberProps = {
  isOpen?: boolean;
  isSpinning?: boolean;
  backgroundBlur?: number;
  backgroundBlurTransition?: Milliseconds;
  centerTop?: JSX.Element;
  centerBottom?: JSX.Element;
  maskColor?: string | number;
  resize?: t.ResizeObserver | t.ResizeObserverHook;
  sealOpacity?: number;
  sealRotate?: number;
  slideDuration?: Milliseconds;
  style?: CssValue;
  onSize?: (size: t.DomRect) => void;
};

export const Antechamber: React.FC<AntechamberProps> = (props) => {
  const {
    backgroundBlur = 6,
    backgroundBlurTransition = 0,
    slideDuration = 200,
    isOpen,
    isSpinning,
    centerBottom,
    centerTop,
    sealOpacity = 1,
    sealRotate = 0,
  } = props;
  const bevelHeight = 45;

  const baseRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(baseRef, { root: props.resize, onSize: props.onSize });

  const backdropFilter = `blur(${backgroundBlur}px)`;
  const maskColor = color.format(props.maskColor ?? 0.75);

  const styles = {
    base: css({ position: 'relative', overflow: 'hidden', pointerEvents: 'none' }),
    ready: css({ Absolute: 0 }),
    notReady: css({
      Absolute: 0,
      backgroundColor: maskColor,
      backdropFilter,
      transition: `backdrop-filter ${backgroundBlurTransition}ms ease`,
    }),
  };

  const elNotReady = !size.ready && <div {...styles.notReady} />;

  const toMask = (edge: MaskProps['edge']) => {
    const height = size.rect?.height / 2;
    return (
      <Mask
        edge={edge}
        backgroundColor={maskColor}
        backdropFilter={backdropFilter}
        backdropFilterTransition={backgroundBlurTransition}
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
        isSpinning={isSpinning}
        bevelHeight={bevelHeight + 3}
        slideDuration={slideDuration}
        sealOpacity={sealOpacity}
        sealRotate={sealRotate}
        centerBottom={centerBottom}
        centerTop={centerTop}
      />
    </div>
  );

  return (
    <div ref={baseRef} {...css(styles.base, props.style)} className={'Sys-Primitives-Antechamber'}>
      {elNotReady}
      {elReady}
    </div>
  );
};
