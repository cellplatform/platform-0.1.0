import React from 'react';
import { PropList, PropListItem } from 'sys.ui.primitives/lib/ui/PropList';

import { color, css, CssValue, t, HashChip } from '../../common';
import { toPropsList } from './props/toList';
import * as m from './types';
import { DEFAULT } from './constants';

export type ModuleInfoProps = {
  manifestUrl?: t.ManifestUrl;
  title?: m.ModuleInfoTitle;
  manifest?: t.ModuleManifest;
  fields?: m.ModuleInfoField[];
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  style?: CssValue;
  onExportClick?: m.ModuleInfoExportClick;
};

export const ModuleInfo: React.FC<ModuleInfoProps> = (props) => {
  const {
    manifestUrl,
    manifest,
    fields = DEFAULT.FIELDS,
    width,
    minWidth = 200,
    maxWidth,
    onExportClick,
  } = props;

  const title = props.title ? props.title : props.title === null ? '' : DEFAULT.TITLE;
  const moduleHash = manifest?.hash.module;

  /**
   * RENDER
   */
  const styles = {
    base: css({
      position: 'relative',
      width,
      minWidth,
      maxWidth,
    }),
    empty: css({
      color: color.format(-0.3),
      fontStyle: 'italic',
      fontSize: 12,
      textAlign: 'center',
      PaddingY: 6,
    }),
    title: {
      base: css({ Flex: 'horizontal-center-spaceBetween' }),
      left: css({}),
      right: css({}),
    },
  };

  const elModuleHash = fields.includes('hash.module:title') && (
    <HashChip text={moduleHash} icon={true} length={DEFAULT.HASH_CHIP_LENGTH} />
  );

  const elTitle = (
    <div {...styles.title.base}>
      <div {...styles.title.left}>{title}</div>
      <div {...styles.title.right}>{elModuleHash}</div>
    </div>
  );

  const items: PropListItem[] = toPropsList({ url: manifestUrl, manifest, fields, onExportClick });
  const elEmpty = !manifest && <div {...styles.empty}>Module not loaded.</div>;
  const elProps = !elEmpty && (
    <PropList title={elTitle} items={items} defaults={{ clipboard: false }} />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elProps}
      {elEmpty}
    </div>
  );
};
