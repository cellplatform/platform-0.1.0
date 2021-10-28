import React from 'react';
import { css, CssValue, PositioningLayers, t, Icons, COLORS, Spinner } from '../common';

const IMAGES = 'static/images/sys.ui';
type Milliseconds = number;

export type BodyProps = {
  isOpen?: boolean;
  isSpinning?: boolean;
  bevelHeight: number;
  centerTop?: JSX.Element;
  centerBottom?: JSX.Element;
  slideDuration: Milliseconds;
  sealOpacity?: number;
  sealRotate?: number;
  style?: CssValue;
};

export const Body: React.FC<BodyProps> = (props) => {
  const { isOpen, isSpinning, sealOpacity } = props;
  const msecs = props.slideDuration;

  const styles = {
    base: css({ Absolute: 0 }),
  };

  const lock: t.PositioningLayer = {
    id: 'lock',
    position: { x: 'center', y: 'center' },
    render() {
      const style = css({
        opacity: isOpen || isSpinning ? 0 : 0.4,
        transition: `opacity ${msecs}ms ease`,
        pointerEvents: 'none',
      });
      return <Icons.Lock.Closed color={COLORS.DARK} opacity={0.3} style={style} />;
    },
  };

  const spinner: t.PositioningLayer = {
    id: 'spinner',
    position: { x: 'center', y: 'center' },
    render() {
      const style = css({
        opacity: isSpinning ? 1 : 0,
        transition: `opacity ${msecs}ms ease`,
        pointerEvents: 'none',
      });
      return <Spinner style={style} />;
    },
  };

  const seal: t.PositioningLayer = {
    id: 'seal',
    position: { x: 'center', y: 'center' },
    render() {
      const styles = {
        base: css({
          opacity: isOpen || isSpinning ? 0 : 1,
          transform: `rotate(${props.sealRotate ?? 0}deg)`,
          transition: `opacity ${msecs}ms ease, transform ${msecs}ms ease`,
          pointerEvents: 'none',
        }),
        image: css({
          Image: [`${IMAGES}/wax.png`, `${IMAGES}/wax@2x.png`, 247, 245],
          transform: `scale(0.5) translateY(12px)`,
          opacity: sealOpacity,
          transition: `opacity ${msecs}ms ease`,
        }),
      };
      return (
        <div {...styles.base}>
          <div {...styles.image} />
        </div>
      );
    },
  };

  type Y = Required<t.BoxPosition>['y'];
  const container = (y: Y, el?: JSX.Element, inner?: CssValue): t.PositioningLayer => {
    return {
      id: `center.${y}`,
      position: { x: 'center', y },
      render(e) {
        const styles = {
          base: css({
            display: 'grid',
            position: 'relative',
            opacity: isOpen ? 0 : 1,
            boxSizing: 'border-box',
            transition: `opacity ${msecs}ms ease`,
            height: e.size.height / 2 - props.bevelHeight,
          }),
        };
        return <div {...css(styles.base, inner)}>{el}</div>;
      },
    };
  };

  const center = {
    top: container('top', props.centerTop, { alignContent: 'end' }),
    bottom: container('bottom', props.centerBottom),
  };

  const layers: t.PositioningLayer[] = [spinner, lock, seal, center.top, center.bottom];

  return (
    <PositioningLayers
      style={styles.base}
      layers={layers}
      childPointerEvents={isOpen ? 'none' : 'auto'}
    />
  );
};
