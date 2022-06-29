import React from 'react';

import { Chip, Color, css, CssValue, DEFAULT, PropList, t } from './common';
import { toPropsList } from './view.props/toList';

export type ModuleInfoProps = {
  url?: t.ManifestUrl;
  title?: t.ModuleInfoTitle;
  manifest?: t.ModuleManifest;
  fields?: t.ModuleInfoFields[];
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  style?: CssValue;
  onExportClick?: t.ModuleInfoExportClick;
};

export const ModuleInfo: React.FC<ModuleInfoProps> = (props) => {
  const {
    url,
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
    base: css({ position: 'relative', width, minWidth, maxWidth }),
    empty: css({
      color: Color.format(-0.3),
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
    <Chip.Hash text={moduleHash} icon={true} length={DEFAULT.HASH_CHIP_LENGTH} />
  );

  const elTitle = (
    <div {...styles.title.base}>
      <div {...styles.title.left}>{title}</div>
      <div {...styles.title.right}>{elModuleHash}</div>
    </div>
  );

  const items: t.PropListItem[] = toPropsList({
    url,
    manifest,
    fields,
    onExportClick,
  });
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
