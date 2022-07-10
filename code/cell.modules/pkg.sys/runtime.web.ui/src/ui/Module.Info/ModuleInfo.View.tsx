import React from 'react';

import { Chip, css, CssValue, DEFAULT, PropList, t } from './common';
import { toPropsList } from './ui.props/toList';
import { Empty } from './ui/Empty';

export type ModuleInfoProps = {
  url?: t.ManifestUrl;
  title?: t.ModuleInfoTitle;
  manifest?: t.ModuleManifest;
  fields?: t.ModuleInfoFields[];
  theme?: t.ModuleInfoTheme;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  empty?: string | JSX.Element | null;
  style?: CssValue;
  onExportClick?: t.ModuleInfoExportClick;
};

export const ModuleInfo: React.FC<ModuleInfoProps> = (props) => {
  const {
    url,
    manifest,
    fields = DEFAULT.FIELDS,
    theme = DEFAULT.THEME,
    width,
    minWidth = 200,
    maxWidth,
    empty,
    onExportClick,
  } = props;

  const title = props.title ? props.title : props.title === null ? '' : DEFAULT.TITLE;
  const moduleHash = manifest?.hash.module;

  /**
   * RENDER
   */
  const styles = {
    base: css({ position: 'relative', width, minWidth, maxWidth }),
    title: {
      base: css({ Flex: 'horizontal-center-spaceBetween' }),
      left: css({}),
      right: css({}),
    },
  };

  const elModuleHash = fields.includes('hash.module:title') && (
    <Chip.Hash text={moduleHash} icon={true} theme={theme} length={DEFAULT.HASH_CHIP_LENGTH} />
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
    theme,
    onExportClick,
  });

  const elEmpty = !manifest && empty !== null && <Empty message={empty} />;

  const elProps = manifest && (
    <PropList title={elTitle} theme={theme} items={items} defaults={{ clipboard: false }} />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elProps}
      {elEmpty}
    </div>
  );
};
