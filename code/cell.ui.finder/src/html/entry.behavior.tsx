import * as React from 'react';

import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { t } from '../common';

export const event$ = new Subject<t.FinderEvent>();

import { Viewer } from '../components/Viewer';
import { Doc } from '../components/Viewer.Doc';

/**
 * TODO 🐷
 * - Move into controller
 */

export function behavior(args: { uri: string }) {
  event$
    .pipe(
      filter((e) => e.type === 'FINDER/render/view'),
      map((e) => e.payload as t.IFinderRenderView),
    )
    .subscribe((e) => {
      const { node } = e;

      if (node === 'intro.files') {
        e.render(<Viewer uri={args.uri} />);
      } else {
        e.render(<Doc />);
      }
    });

  return { event$ };
}
