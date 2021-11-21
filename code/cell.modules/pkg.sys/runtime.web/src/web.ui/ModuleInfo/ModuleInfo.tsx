import React from 'react';
import { PropList, PropListItem } from 'sys.ui.primitives/lib/ui/PropList';

import { color, css, CssValue, t } from '../../common';
import { toPropsList } from './props/toList';
import * as m from './types';

export type ModuleInfoProps = {
  manifestUrl?: t.ManifestUrl;
  title?: m.ModuleInfoTitle;
  manifest?: t.ModuleManifest;
  fields?: m.ModuleInfoFields[];
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  style?: CssValue;
  onExportClick?: m.ModuleInfoExportClick;
};

export const ModuleInfo: React.FC<ModuleInfoProps> = (props) => {
  const { manifestUrl, manifest, fields, width, minWidth = 200, maxWidth, onExportClick } = props;

  const DEFAULT = {
    title: 'Module',
  };

  const title = props.title ? props.title : props.title === null ? '' : DEFAULT.title;

  const styles = {
    base: css({ position: 'relative', width, minWidth, maxWidth }),
    empty: css({
      color: color.format(-0.3),
      fontStyle: 'italic',
      fontSize: 12,
      textAlign: 'center',
      PaddingY: 6,
    }),
  };

  const items: PropListItem[] = toPropsList({ url: manifestUrl, manifest, fields, onExportClick });
  const elEmpty = !manifest && <div {...styles.empty}>Module not loaded.</div>;
  const elProps = !elEmpty && (
    <PropList title={title} items={items} defaults={{ clipboard: false }} />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elProps}
      {elEmpty}
    </div>
  );
};
