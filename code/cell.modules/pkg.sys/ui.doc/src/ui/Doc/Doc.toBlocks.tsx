import React from 'react';

import { t } from '../common';
import * as Doc from './libs';

/**
 * Convert a document definition to a list of BLOCK elements.
 */
export function toBlockElements(props: { def: t.DocDef; width: number }): JSX.Element[] {
  const { def, width } = props;

  const elBanner = def.banner && (
    <Doc.Block.Image url={def.banner.url} credit={def.banner.credit} width={width} />
  );

  const elByline = (
    <Doc.Byline
      version={def.version}
      author={def.author}
      style={{ marginBottom: 20, marginRight: 8 }}
    />
  );

  const elHeadline = (
    <Doc.Headline
      style={{ marginBottom: 90 }}
      category={def.category}
      title={def.title}
      subtitle={def.subtitle}
      hint={{ width }}
    />
  );

  const blocks = (def.blocks || []).map((def, i) => {
    if (def.kind === 'Markdown') {
      return <Doc.Block.Markdown markdown={def.text} margin={def.margin} />;
    }

    if (def.kind === 'Image') {
      return (
        <Doc.Block.Image url={def.url} credit={def.credit} width={width} margin={def.margin} />
      );
    }

    if (def.kind === 'InsetPanel') {
      return <Doc.Block.InsetPanel markdown={def.markdown} margin={def.margin} />;
    }

    return;
  });

  // Finish up.
  return [
    //
    elBanner,
    elByline,
    elHeadline,
    ...blocks,
  ].filter(Boolean) as JSX.Element[];
}
