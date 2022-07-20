import React, { useState } from 'react';
import { Color, COLORS, css, CssValue, t, LoadMask, ModuleInfo, Chip } from '../common';

export type ManifestInfoProps = {
  instance: t.ModuleInstance;
  theme: t.ModuleTheme;
  url: URL;
  style?: CssValue;
  onExportClick?: t.ModuleInfoExportClick;
};

export const ManifestInfo: React.FC<ManifestInfoProps> = (props) => {
  const { url, theme } = props;
  const entry = url.searchParams.get('entry');
  const isDark = theme == 'Dark';

  const [loaded, setLoaded] = useState(false);
  const [manifest, setManifest] = useState<t.ModuleManifest>();

  const fields: t.ModuleInfoFields[] = [];
  const push = (field: t.ModuleInfoFields) => fields.push(field);

  push('source:url');
  push('version');
  push('namespace');
  push('files');
  if (entry) push('source:url:entry');
  if (!entry) fields.push('remote.exports');

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: 0, pointerEvents: 'auto' }),
    body: css({ marginTop: 25 }),
    hashChip: css({ Absolute: [8, 8, null, null] }),
  };

  const elHashChip = manifest && (
    <Chip.Hash
      text={manifest.hash.module}
      icon={false}
      length={5}
      theme={theme}
      style={styles.hashChip}
    />
  );

  const elBody = (
    <div {...styles.body} style={{ display: loaded ? 'block' : 'none' }}>
      <ModuleInfo.Stateful
        url={url.href}
        fields={fields}
        minWidth={250}
        empty={null}
        theme={theme}
        onExportClick={props.onExportClick}
        onLoaded={(e) => {
          setLoaded(e.is.loaded);
          setManifest(e.json);
        }}
      />
      {elHashChip}
    </div>
  );

  return (
    <LoadMask
      style={css(styles.base, props.style)}
      theme={theme}
      spinner={!loaded}
      bg={{ blur: 8 }}
      tile={{
        el: elBody,
        padding: [30, 50],
        size: { minWidth: 250 + 40 + 40 },
        backgroundColor: isDark ? Color.format(0.03) : Color.alpha(COLORS.DARK, 0.04),
        borderColor: isDark ? Color.format(0.03) : Color.alpha(COLORS.DARK, 0.04),
      }}
    />
  );
};
