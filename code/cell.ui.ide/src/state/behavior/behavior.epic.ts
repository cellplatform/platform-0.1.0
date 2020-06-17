import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
import { t, time, TypeSystem } from '../../common';

/**
 * Async (epic) controller.
 */
export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  const { ctx, store } = args;

  store
    .on<t.IIdeInitializeEvent>('APP:IDE/initialize')
    .pipe()
    .subscribe(async (e) => {
      //
      console.log('init', e);

      const sheet = await ctx.client.sheet<t.App>('sys.app');
      const apps = await sheet.data<t.App>('App').load();

      const changeMonitor = TypeSystem.ChangeMonitor.create();
      changeMonitor.watch(sheet);

      changeMonitor.changed$.pipe(debounceTime(50)).subscribe((e) => {
        console.log('changed', e);
        // return;

        ctx.fire({
          type: 'IPC/sheet/changed',
          payload: {
            source: ctx.def,
            ns: e.sheet.uri.id,
            changes: e.changes,
          },
        });
      });

      // const instances = await ctx.client.sheet<t.AppWindow>('')

      console.log('apps.total', apps.total);

      const app = apps.find((app) => app.name === 'ui.ide');

      console.log('app', app);
      if (app) {
        console.log('name', app.toObject());

        // app.d
        const data = await app.props.data.data();

        console.log('data.total', data.total);

        // data.row(0).props.

        const row = data.row(0);

        console.log('BEFORE', row.props.tmp);
        row.props.tmp = 'hello';
        console.log('AFTER', row.props.tmp);
      }

      /**
       *
       */
      changeThing();

      // const app =
    });

  async function changeThing() {
    const ns = 'ckbiugrky000d456cdk06t0tx';
    const sheet = await ctx.client.sheet(ns);
    const data = await sheet.data<t.AppWindow>('AppWindow').load();

    const row = data.row(0);

    console.log('row.toObject()', row.toObject());

    row.props.title = 'Hello 👋';

    await time.wait(50);

    const changes = sheet.state.changes;
    console.log('changes', changes);

    ctx.fire({
      type: 'IPC/sheet/changed',
      payload: {
        source: ctx.def,
        ns: sheet.uri.id,
        changes: changes,
      },
    });
  }
}
