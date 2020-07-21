import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, take, takeWhile, map, filter, share, delay, distinctUntilChanged, debounceTime, tap  } from 'rxjs/operators';

import { expect, t } from '../test';
import { TreeNavController } from '.';
import { TreeState } from '../state';

describe('TreeNavController', () => {
  
  it('create', () => {

    const treeview$ = new Subject<t.TreeViewEvent>()
    const state = TreeState.create()

    const res = TreeNavController.create({treeview$, state})
  });
});