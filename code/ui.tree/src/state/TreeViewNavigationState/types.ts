import { Observable } from 'rxjs';
import * as t from '../../common/types';

/**
 * Keeps a state object in sync with navigation changes.
 */
export type ITreeViewNavigationCtrl = t.IDisposable & {
  readonly changed$: Observable<ITreeViewNavigationCtrlChanged>;
  readonly store: t.IStateObject<t.ITreeViewNavigationState>;
  readonly root: t.ITreeViewNode;
  readonly current?: string; // Node ID.
  readonly selected?: string; // Node ID.
  change(args: ITreeViewNavigationSelection): ITreeViewNavigationCtrl;
  patch(args: Partial<ITreeViewNavigationSelection>): ITreeViewNavigationCtrl;
};

export type ITreeViewNavigationCtrlChanged = t.IStateObjectChanged<ITreeViewNavigationState>;

/**
 * Navigation properties
 */
export type ITreeViewNavigationState = { root: t.ITreeViewNode; nav: ITreeViewNavigationSelection };
export type ITreeViewNavigationSelection = {
  current?: string; // Node ID.
  selected?: string; // Node ID.
};
