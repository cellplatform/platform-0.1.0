import React, { useState } from 'react';

import { COLORS, constants, css, CssValue, t, markdown, DEFAULT } from '../../common';
import { Icons } from '../Icons';

/**
 * The button view, with no smarts about the event bus.
 */
export type ButtonViewProps = {
  label: React.ReactNode;
  description?: React.ReactNode;
  placeholder?: boolean;
  isActive: boolean;
  icon?: t.IIcon;
  right?: React.ReactNode;
  style?: CssValue;
  onClick?: () => void;
};
export const ButtonView: React.FC<ButtonViewProps> = (props) => {
  const { isActive, placeholder, onClick } = props;
  const [isOver, setIsOver] = useState<boolean>(false);
  const [isDown, setIsDown] = useState<boolean>(false);

  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      color: COLORS.DARK,
    }),
    main: {
      outer: css({
        Flex: 'horizontal-stretch-stretch',
        PaddingY: 2,
        paddingLeft: 12,
        paddingRight: 15,
        cursor: isActive ? 'pointer' : 'default',
        opacity: isActive ? 1 : 0.4,
      }),
      icon: css({
        opacity: isOver ? 1 : 0.4,
        width: 20,
      }),
    },
    body: {
      outer: css({
        flex: 1,
        marginLeft: 6,
        marginTop: 5,
        overflow: 'hidden',
      }),
      label: css({
        width: '100%',
        fontFamily: constants.FONT.MONO,
        fontStyle: placeholder ? 'italic' : undefined,
        fontSize: 12,
        color: isOver && isActive ? COLORS.BLUE : COLORS.DARK,
        opacity: !isActive ? 0.6 : !placeholder ? 1 : isOver ? 1 : 0.6,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        transform: isDown ? `translateY(1px)` : undefined,
      }),
      description: css({
        fontSize: 11,
        marginTop: 4,
        opacity: 0.6,
      }),
    },
  };

  const overHandler = (isOver: boolean) => () => {
    if (isActive) {
      setIsOver(isOver);
      if (!isOver) setIsDown(false);
    }
  };

  const clickHandler = (isDown: boolean) => (e: React.MouseEvent) => {
    if (isActive && e.button === 0) {
      setIsDown(isDown);
      if (isDown && onClick) onClick();
    }
  };

  const Icon = props.icon || Icons.Variable;

  const label = props.label ? formatText(props.label) : DEFAULT.UNNAMED;
  const description = props.description ? formatText(props.description) : undefined;

  return (
    <div {...css(styles.base, props.style)}>
      <div
        {...styles.main.outer}
        onMouseEnter={overHandler(true)}
        onMouseLeave={overHandler(false)}
        onMouseDown={clickHandler(true)}
        onMouseUp={clickHandler(false)}
      >
        <Icon color={isOver ? COLORS.BLUE : COLORS.DARK} size={20} style={styles.main.icon} />
        <div {...styles.body.outer}>
          <div {...styles.body.label}>{label}</div>
          {description && <div {...styles.body.description}>{description}</div>}
        </div>
        {props.right}
      </div>
    </div>
  );
};

/**
 * [Helpers]
 */

function formatText(value?: string | t.ReactNode) {
  if (typeof value !== 'string') return value;

  const __html = markdown
    .toHtmlSync(value)
    .replace(/^\<p\>/, '')
    .replace(/\<\/\p\>$/, '');

  return <div dangerouslySetInnerHTML={{ __html }} />;
}
