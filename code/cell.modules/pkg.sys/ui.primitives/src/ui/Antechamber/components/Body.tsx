import React from 'react';
import { css, CssValue, PositioningLayers, t } from '../common';

const IMAGES = 'static/images/sys.ui';
type Milliseconds = number;

export type BodyProps = {
  isOpen?: boolean;
  bevelHeight: number;
  centerTop?: JSX.Element;
  centerBottom?: JSX.Element;
  slideDuration: Milliseconds;
  style?: CssValue;
};

export const Body: React.FC<BodyProps> = (props) => {
  const { isOpen } = props;
  const msecs = props.slideDuration;

  const styles = {
    base: css({ Absolute: 0 }),
  };

  const seal: t.PositioningLayer = {
    id: 'seal',
    position: { x: 'center', y: 'center' },
    render() {
      const styles = {
        base: css({
          opacity: isOpen ? 0 : 1,
          transform: `rotate(${isOpen ? 25 : 0}deg)`,
          transition: `opacity ${msecs}ms ease, transform ${msecs}ms ease`,
        }),
        image: css({
          Image: [`${IMAGES}/wax.png`, `${IMAGES}/wax@2x.png`, 247, 245],
          transform: `scale(0.5) translateY(12px)`,
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

  const layers: t.PositioningLayer[] = [seal, center.top, center.bottom];

  return <PositioningLayers style={styles.base} layers={layers} />;
};
