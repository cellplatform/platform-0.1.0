import React, { useState } from 'react';
import { Color, COLORS, css, CssValue, t, LoadMask, ModuleInfo } from '../common';

export type InfoProps = {
  instance: t.ModuleInstance;
  theme: t.ModuleTheme;
  url: URL;
  style?: CssValue;
  onExportClick?: t.ModuleInfoExportClick;
};

export const Info: React.FC<InfoProps> = (props) => {
  const { url } = props;
  const entry = url.searchParams.get('entry');

  const [loaded, setLoaded] = useState(false);

  const fields: t.ModuleInfoFields[] = [];
  const push = (field: t.ModuleInfoFields) => fields.push(field);

  push('hash.module:title');
  push('source:url');
  push('namespace');
  push('version');
  if (entry) push('source:url:entry');
  if (!entry) fields.push('remote.exports');

  /**
   * [Render]
   */
  const styles = { base: css({ Absolute: 0, pointerEvents: 'auto' }) };
  const el = (
    <ModuleInfo.Stateful
      url={url.href}
      fields={fields}
      minWidth={250}
      empty={null}
      onExportClick={props.onExportClick}
      onLoaded={(e) => setLoaded(e.is.loaded)}
      style={{ display: loaded ? 'block' : 'none' }}
    />
  );

  return (
    <LoadMask
      style={css(styles.base, props.style)}
      theme={props.theme}
      spinner={!loaded}
      bg={{ blur: 8 }}
      tile={{
        el,
        padding: [30, 40],
        size: { minWidth: 250 + 40 + 40 },
        backgroundColor: Color.alpha(COLORS.DARK, 0.04),
      }}
    />
  );
};
