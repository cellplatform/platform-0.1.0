import { Subject, Observable } from 'rxjs';
import { share } from 'rxjs/operators';

const dynamics = require('dynamics.js');

export type MoveType =
  | 'spring'
  | 'bounce'
  | 'forceWithGravity'
  | 'gravity'
  | 'easeInOut'
  | 'easeIn'
  | 'easeOut'
  | 'linear'
  | 'bezier';

export type MoveObservable = Observable<MoveTargetProps>;
export type MoveTargetProps = { [key: string]: number | string };
export type IMoveOptions = {
  type: MoveType;
  duration: number;
  frequency?: number;
  friction?: number;
  bounciness?: number;
  delay?: number;
  anticipationSize?: number;
  anticipationStrength?: number;
};

export type IMoveObservableOptions = IMoveOptions & {
  target: MoveTargetProps;
  current: () => object;
};

/**
 * Animates an HtmlElement or object to the given set of property values.
 * See:
 *    https://github.com/michaelvillar/dynamics.js#usage
 *
 * Example: see [README]
 *
 */
function animate(target: MoveTargetProps | HTMLElement, props: object, options: IMoveOptions) {
  return new Promise((resolve, reject) => {
    const type = dynamics[options.type];
    const args = {
      ...options,
      type,
      complete: () => resolve(),
    };
    dynamics.animate(target, props, args);
  });
}

/**
 * Animates to a target set of values via an Observable.
 */
export function start(args: IMoveObservableOptions) {
  const { target } = args;
  const subject = new Subject<MoveTargetProps>();
  const obj = {};
  const define = (key: string) => {
    Object.defineProperty(obj, key, {
      get: () => args.current()[key],
      set: (value: any) => subject.next({ [key]: value }),
    });
  };
  Object.keys(target).forEach(key => define(key));

  setTimeout(async () => {
    // NB: Allow for the Observable to be returned to
    //     the call-site before starting the animation.
    await animate(obj, target, args);
    subject.complete();
  }, 0);
  return subject.pipe(share()) as MoveObservable;
}
