import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Keyboard, t } from '../common';

export class BindingMonitor {
  /**
   * [Lifecycle]
   */
  constructor(args: { grid: t.IGrid }) {
    const { grid } = args;
    const keydown$ = grid.events$.pipe(
      filter(e => e.type === 'GRID/keydown'),
      filter(e => grid.isReady),
      filter(e => !grid.isEditing),
      map(e => e.payload as t.IGridKeydown),
    );
    this.grid = grid;
    this.keydown$ = keydown$;
  }

  /**
   * [Fields]
   */
  public readonly grid: t.IGrid;
  public readonly keydown$: Observable<t.IGridKeydown>;

  /**
   * [Methods]
   */
  public is(command: t.GridCommand, e: t.IGridKeydown) {
    const binding = this.grid.keyBindings.find(binding => binding.command === command);
    return binding ? Keyboard.matchEvent(binding.key, e) : false;
  }

  public monitor(command: t.GridCommand, handler: (e: t.IGridKeydown) => void) {
    this.keydown$.pipe(filter(e => this.is(command, e))).subscribe(e => handler(e));
  }
}
