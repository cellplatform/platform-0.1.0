import React from 'react';

import { color, css, CssValue, filesize, t } from '../../common';

export type ManifestFilesProps = {
  manifest: t.ModuleManifest;
  style?: CssValue;
};

export const ManifestFiles: React.FC<ManifestFilesProps> = (props) => {
  const { manifest } = props;

  const styles = {
    base: css({
      Scroll: true,
      position: 'relative',
      boxSizing: 'border-box',
      userSelect: 'none',
    }),
    body: css({
      display: 'grid',
      gridTemplateColumns: 'auto 80px',
      fontSize: 12,
      paddingTop: 10,
      paddingBottom: 20,
    }),
    item: {
      base: css({
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        PaddingY: 6,
        PaddingX: 12,
      }),
      size: css({
        textAlign: 'right',
        color: color.format(-0.4),
      }),
    },
  };

  const elRows = manifest.files.map((file) => {
    const hash = file.filehash;
    const size = filesize(file.bytes, { round: 0 });
    const style = styles.item;

    return (
      <>
        <div key={`${hash}.name`} {...style.base}>
          <File file={file} />
        </div>
        <div key={`${hash}.size`} {...css(style.base, style.size)}>
          {size}
        </div>
      </>
    );
  });

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>{elRows}</div>
    </div>
  );
};

/**
 * Single file
 */
export type FileProps = { file: t.ManifestFile; style?: CssValue };

export const File: React.FC<FileProps> = (props) => {
  const { file } = props;
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>+++{file.path}</div>;
};
