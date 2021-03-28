import { color, css, CssValue, style } from '@platform/css';
import { defaultValue } from '@platform/util.value';
import React, { useState } from 'react';

import { t } from '../common';
import { ButtonTheme } from './ButtonTheme';

export type ButtonProps = {
  id?: string;
  children?: React.ReactNode;
  label?: string;
  isEnabled?: boolean;
  block?: boolean;
  theme?: Partial<t.IButtonTheme>;
  overTheme?: Partial<t.IButtonTheme>;
  downTheme?: Partial<t.IButtonTheme>;
  margin?: t.CssEdgesInput;
  minWidth?: number;
  tooltip?: string;
  style?: CssValue;
  onClick?: React.MouseEventHandler;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
};

export type IButtonState = {
  isDown?: boolean;
  isOver?: boolean;
};

function toTheme(props: ButtonProps, isOver: boolean, isDown: boolean) {
  const { theme } = props;
  const overTheme = defaultValue(props.overTheme, props.theme);
  const downTheme = defaultValue(props.downTheme, overTheme);
  const current = isDown ? downTheme : isOver ? overTheme : theme;
  return ButtonTheme.merge(ButtonTheme.BASE, current || {});
}

export const Button: React.FC<ButtonProps> = (props) => {
  const [isOver, setIsOver] = useState<boolean>(false);
  const [isDown, setIsDown] = useState<boolean>(false);

  const { block = false, minWidth } = props;
  const isEnabled = defaultValue(props.isEnabled, true);

  const theme = toTheme(props, isOver, isDown);
  const { backgroundColor: bg } = theme;
  const backgroundColor = isEnabled ? bg.enabled : bg.disabled || bg.enabled;

  const overHandler = (isOver: boolean): React.MouseEventHandler => {
    return (e) => {
      setIsOver(isOver);
      if (!isOver && isDown) setIsDown(false);
      if (isEnabled) {
        if (isOver && props.onMouseEnter) props.onMouseEnter(e);
        if (!isOver && props.onMouseLeave) props.onMouseLeave(e);
      }
    };
  };

  const downHandler = (isDown: boolean): React.MouseEventHandler => {
    return (e) => {
      setIsDown(isDown);
      if (isEnabled) {
        if (isDown && props.onMouseDown) props.onMouseDown(e);
        if (!isDown && props.onMouseUp) props.onMouseUp(e);
        if (!isDown && props.onClick) props.onClick(e);
      }
    };
  };

  const styles = {
    base: css({
      ...style.toMargins(props.margin),
      boxSizing: 'border-box',
      position: 'relative',
      display: block ? 'block' : 'inline-block',
      color: color.format(
        isEnabled ? theme.color.enabled : theme.color.disabled || theme.color.enabled,
      ),
      backgroundColor: backgroundColor ? color.format(backgroundColor) : undefined,
      cursor: isEnabled ? 'pointer' : undefined,
      userSelect: 'none',
    }),
    inner: css({
      minWidth,
      Flex: 'center-center',
    }),
    border:
      theme.border.isVisible &&
      css({
        ...style.toPadding(theme.border.padding),
        border: `solid ${theme.border.thickness}px ${color.format(theme.border.color)}`,
        borderRadius: theme.border.radius,
      }),
    content: css({
      transform: isEnabled ? `translateY(${isDown ? 1 : 0}px)` : undefined,
      opacity: isEnabled ? 1 : theme.disabledOpacity,
    }),
  };

  return (
    <div
      {...css(styles.base, styles.border, props.style)}
      title={props.tooltip}
      onMouseEnter={overHandler(true)}
      onMouseLeave={overHandler(false)}
      onMouseDown={downHandler(true)}
      onMouseUp={downHandler(false)}
    >
      <div {...styles.inner}>
        <div {...styles.content}>
          {props.label}
          {props.children}
        </div>
      </div>
    </div>
  );
};

// type B = React.FC<ButtonProps> & { theme: typeof ButtonTheme };

// export const Button = ButtonView as B;

/**
 * A simple clickable button primitive.
 */
// export class Button extends React.PureComponent<ButtonProps, IButtonState> {
//   /**
//    * [Static]
//    */
//   public static theme = ButtonTheme;

//   public static mouseState(
//     props: Mouse.IMouseEventProps,
//     state$: Subject<{ isDown?: boolean; isOver?: boolean }>,
//     unmounted$: Observable<void>,
//     getEnabled: () => boolean,
//   ) {
//     const res = Mouse.fromProps(props, {
//       force: true,
//       getEnabled,
//     });

//     const mouse$ = res.events$.pipe(
//       takeUntil(unmounted$),
//       filter(() => getEnabled()),
//     );

//     mouse$.pipe(filter((e) => e.type === 'DOWN')).subscribe((e) => state$.next({ isDown: true }));
//     mouse$.pipe(filter((e) => e.type === 'UP')).subscribe((e) => state$.next({ isDown: false }));
//     mouse$.pipe(filter((e) => e.type === 'ENTER')).subscribe((e) => state$.next({ isOver: true }));
//     mouse$.pipe(filter((e) => e.type === 'LEAVE')).subscribe((e) => state$.next({ isOver: false }));

//     return res;
//   }

//   /**
//    * [Fields]
//    */
//   public state: IButtonState = {};
//   private unmounted$ = new Subject<void>();
//   private state$ = new Subject<IButtonState>();
//   private events$ = new Subject<t.ButtonEvent>();
//   private mouse: Mouse.IMouseHandlers;

//   /**
//    * [Lifecycle]
//    */
//   constructor(props: ButtonProps) {
//     super(props);

//     // Setup observables.
//     const state$ = this.state$.pipe(takeUntil(this.unmounted$));
//     const events$ = this.events$.pipe(takeUntil(this.unmounted$));

//     // Bubble events through given observable.
//     if (this.props.events$) {
//       events$.subscribe(this.props.events$);
//     }

//     // Update state.
//     state$.subscribe((e) => this.setState(e));

//     // Setup Mouse.
//     this.mouse = ButtonMouse.state(this.props, this.state$, this.unmounted$, () => this.isEnabled);
//     const mouse$ = this.mouse.events$.pipe(takeUntil(this.unmounted$));
//     mouse$.subscribe((e) => this.fire({ type: 'BUTTON/mouse', payload: { ...e, id: this.id } }));
//   }

//   public componentWillUnmount() {
//     this.unmounted$.next();
//     this.unmounted$.complete();
//   }

//   /**
//    * [Properties]
//    */
//   public get id() {
//     return this.props.id || '';
//   }

//   public get isEnabled() {
//     return defaultValue(this.props.isEnabled, true);
//   }

//   private get theme() {
//     const { isOver, isDown } = this.state;
//     const { theme } = this.props;
//     const overTheme = defaultValue(this.props.overTheme, this.props.theme);
//     const downTheme = defaultValue(this.props.downTheme, overTheme);
//     const current = isDown ? downTheme : isOver ? overTheme : theme;
//     return ButtonTheme.merge(ButtonTheme.BASE, current || {});
//   }

//   /**
//    * [Methods]
//    */
//   private fire(e: t.ButtonEvent) {
//     this.events$.next(e);
//   }

//   /**
//    * [Render]
//    */
//   public render() {
//     const { block = false, minWidth } = this.props;
//     const { isDown = false } = this.state;
//     const isEnabled = this.isEnabled;

//     const theme = this.theme;
//     const { backgroundColor: bg } = theme;
//     const backgroundColor = isEnabled ? bg.enabled : bg.disabled || bg.enabled;

//     const styles = {
//       base: css({
//         ...style.toMargins(this.props.margin),
//         boxSizing: 'border-box',
//         position: 'relative',
//         display: block ? 'block' : 'inline-block',
//         color: color.format(
//           isEnabled ? theme.color.enabled : theme.color.disabled || theme.color.enabled,
//         ),
//         backgroundColor: backgroundColor ? color.format(backgroundColor) : undefined,
//         cursor: isEnabled ? 'pointer' : undefined,
//         userSelect: 'none',
//       }),
//       inner: css({
//         minWidth,
//         Flex: 'center-center',
//       }),
//       border:
//         theme.border.isVisible &&
//         css({
//           ...style.toPadding(theme.border.padding),
//           border: `solid ${theme.border.thickness}px ${color.format(theme.border.color)}`,
//           borderRadius: theme.border.radius,
//         }),
//       content: css({
//         transform: isEnabled ? `translateY(${isDown ? 1 : 0}px)` : undefined,
//         opacity: isEnabled ? 1 : theme.disabledOpacity,
//       }),
//     };

//     return (
//       <div
//         {...css(styles.base, styles.border, this.props.style)}
//         {...this.mouse.events}
//         title={this.props.tooltip}
//       >
//         <div {...styles.inner}>
//           <div {...styles.content}>
//             {this.props.label}
//             {this.props.children}
//           </div>
//         </div>
//       </div>
//     );
//   }
// }
