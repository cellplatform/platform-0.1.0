import { DragTarget, DragTargetEvent } from '@platform/cell.ui/lib/components/DragTarget';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, COLORS, css, CssValue, defaultValue, t, ui } from '../../common';

export type DropEvent = { dir: string; files: t.IHttpClientCellFileUpload[]; urls: string[] };
export type DropEventHandler = (e: DropEvent) => void;

export type IInstallerDragTarget = {
  defaultMessage?: string;
  dropMessage?: string;
  style?: CssValue;
  onDrop?: DropEventHandler;
  onDragOver?: () => void;
  onDragLeave?: () => void;
};
export type InstallerDragTargetState = {
  isDragOver?: boolean;
};

export class InstallerDragTarget extends React.PureComponent<
  IInstallerDragTarget,
  InstallerDragTargetState
> {
  public state: InstallerDragTargetState = {};
  private state$ = new Subject<Partial<InstallerDragTargetState>>();
  private unmounted$ = new Subject();
  private drag$ = new Subject<DragTargetEvent>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    const drag$ = this.drag$.pipe(takeUntil(this.unmounted$));
    const dragTarget = DragTarget.events(drag$);

    dragTarget.over$.subscribe((e) => {
      const { isDragOver } = e;
      const { onDragOver, onDragLeave } = this.props;
      if (isDragOver && onDragOver) {
        onDragOver();
      }
      if (!isDragOver && onDragLeave) {
        onDragLeave();
      }

      this.state$.next({ isDragOver });
    });

    dragTarget.drop$.subscribe(async (e) => {
      const { urls, dir, files } = e;
      this.fireDrop({ dir, urls, files });
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get defaultMessage() {
    return defaultValue(this.props.defaultMessage, 'Drag to Install App');
  }

  public get dropMessage() {
    return defaultValue(this.props.dropMessage, 'Drop App');
  }

  public get message() {
    return this.state.isDragOver ? this.dropMessage : this.defaultMessage;
  }

  /**
   * [Methods]
   */
  public async fireDrop(args: {
    dir: string;
    files: t.IHttpClientCellFileUpload[];
    urls: string[];
  }) {
    const { onDrop: onInstall } = this.props;
    if (onInstall) {
      const { dir, files, urls } = args;
      onInstall({ dir, files, urls });
    }
    this.state$.next({ isDragOver: false });
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({ Absolute: 0 }),
      drag: css({
        WebkitAppRegion: 'drag',
        userSelect: 'none',
        display: 'flex',
        color: COLORS.DARK,
        Absolute: 0,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <DragTarget style={styles.drag} event$={this.drag$}>
          {this.renderBody()}
        </DragTarget>
      </div>
    );
  }

  private renderBody() {
    const { isDragOver } = this.state;

    const styles = {
      base: css({
        flex: 1,
        display: 'flex',
        Flex: 'vertical-center-center',
      }),
      label: css({
        fontSize: 20,
        fontWeight: 'bolder',
        letterSpacing: -0.8,
        cursor: 'default',
        pointerEvents: 'none',
      }),
    };

    return (
      <div {...styles.base}>
        {isDragOver && this.renderDropBorder()}
        <div {...styles.label}>{this.message}</div>
      </div>
    );
  }

  private renderDropBorder() {
    const styles = {
      base: css({
        Absolute: 8,
        border: `dashed 3px ${color.format(-0.1)}`,
        borderRadius: 10,
        pointerEvents: 'none',
      }),
    };
    return <div {...styles.base} />;
  }
}
