import { Mouse } from '@platform/react';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

export const ButtonMouse = {
  state(
    props: Mouse.IMouseEventProps,
    state$: Subject<{ isDown?: boolean; isOver?: boolean }>,
    unmounted$: Observable<void>,
    getEnabled: () => boolean,
  ) {
    const res = Mouse.fromProps(props, {
      force: true,
      getEnabled,
    });

    const mouse$ = res.events$.pipe(
      takeUntil(unmounted$),
      filter(() => getEnabled()),
    );

    mouse$.pipe(filter((e) => e.type === 'DOWN')).subscribe((e) => state$.next({ isDown: true }));
    mouse$.pipe(filter((e) => e.type === 'UP')).subscribe((e) => state$.next({ isDown: false }));
    mouse$.pipe(filter((e) => e.type === 'ENTER')).subscribe((e) => state$.next({ isOver: true }));
    mouse$.pipe(filter((e) => e.type === 'LEAVE')).subscribe((e) => state$.next({ isOver: false }));

    return res;
  },
};
