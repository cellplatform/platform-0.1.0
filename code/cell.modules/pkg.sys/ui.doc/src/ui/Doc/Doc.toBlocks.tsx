import React from 'react';

import { t } from '../common';
import * as Doc from './libs';

/**
 * Convert a document definition to a list of BLOCK elements.
 */
export function toBlockElements(props: { doc: t.DocDef; width: number }): JSX.Element[] {
  const { doc, width } = props;

  const elBanner = doc.banner && (
    <Doc.Image
      url={doc.banner.url}
      credit={doc.banner.credit}
      width={width}
      ratio={doc.banner.ratio}
    />
  );

  const elHeaderByline = (
    <Doc.Block.Byline
      version={doc.version}
      author={doc.author}
      parts={['Space', 'Doc.Identity']}
      style={{ marginBottom: 20, marginRight: 8 }}
    />
  );

  const elFooterByline = (
    <Doc.Block.Byline
      version={doc.version}
      author={doc.author}
      parts={['Doc.Identity', 'Doc.Author.Signature']}
      divider={{ thickness: 3, opacity: 0.1 }}
      style={{ marginTop: 140 }}
    />
  );

  const elHeadline = (
    <Doc.Headline
      style={{ marginBottom: 90 }}
      category={doc.category}
      title={doc.title}
      subtitle={doc.subtitle}
      hint={{ width }}
    />
  );

  const blocks = (doc.blocks || []).map((def, i) => {
    if (def.kind === 'Markdown' && def.markdown) {
      return <Doc.Block.Markdown markdown={def.markdown} margin={def.margin} />;
    }

    if (def.kind === 'Image' && def.url) {
      return (
        <Doc.Image
          url={def.url}
          credit={def.credit}
          width={width}
          ratio={def.ratio}
          margin={def.margin}
        />
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
    elHeaderByline,
    elHeadline,
    ...blocks,
    elFooterByline,
  ].filter(Boolean) as JSX.Element[];
}
