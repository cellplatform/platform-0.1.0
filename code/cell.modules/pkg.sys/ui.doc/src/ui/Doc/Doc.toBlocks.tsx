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

  const elBylineTop = (
    <Doc.Block.Byline
      version={def.version}
      author={def.author}
      align={'Right'}
      style={{ marginBottom: 20, marginRight: 8 }}
    />
  );

  const elBylineBottom = (
    <Doc.Block.Byline
      version={def.version}
      author={def.author}
      align={'Left'}
      divider={{ thickness: 3, opacity: 0.1 }}
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
    elBylineTop,
    elHeadline,
    ...blocks,
    elBylineBottom,
  ].filter(Boolean) as JSX.Element[];
}
