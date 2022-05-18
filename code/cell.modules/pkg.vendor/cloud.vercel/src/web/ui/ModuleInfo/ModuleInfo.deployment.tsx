import React from 'react';

import { t, time, Filesize, HashChip, COLORS, css } from '../common';
import { Icons } from '../Icons';

export function toDeploymentResponse(data?: t.VercelHttpDeployResponse) {
  if (!data) return;

  const ok = data.ok;
  const bytes = data.deployment.bytes;
  const totalFiles = data.paths.length;
  const totalFilesSuffix = totalFiles === 0 ? 'file' : 'files';
  const size = `${Filesize(bytes, { spacer: '' })} (${totalFiles} ${totalFilesSuffix})`;
  const status = `${data.status}${ok ? ' OK' : ''}`;
  const elapsed = time.duration(data.deployment.elapsed).toString();
  const urls = data.deployment.urls;

  /**
   * List
   */
  const items: t.PropListItem[] = [
    { label: 'status', value: <div>{status}</div> },
    { label: 'elapsed', value: { data: elapsed } },
    { label: 'name', value: { data: data.deployment.name } },
    { label: 'fileshash', value: <HashChip text={data.deployment.meta.fileshash} /> },
    { label: 'size', value: { data: size } },
    { label: 'kind', value: { data: data.deployment.meta.kind } },
    {
      label: <LinkLabel text={'deployment'} />,
      value: <Anchor label={'inspect'} url={urls.inspect} />,
    },
    ...urls.public.map((url) => ({
      label: <LinkLabel text={'public'} />,
      value: <Anchor url={url} />,
    })),
  ];

  return items;
}

/**
 * Helpers
 */
const Anchor = (props: { label?: string; url: string }) => {
  let label = (props.label ?? props.url).trim();
  if (label.endsWith('vercel.app')) label = 'perma-link';
  const styles = { base: css({ color: COLORS.BLUE }) };
  return (
    <a href={props.url} target={'_blank'} rel="noreferrer" {...styles.base}>
      {label}
    </a>
  );
};

const LinkLabel = (props: { text?: string }) => {
  const styles = {
    base: css({ Flex: 'x-center-center' }),
    icon: css({ marginRight: 5, opacity: 0.35 }),
  };
  return (
    <div {...styles.base}>
      <Icons.Link color={COLORS.DARK} size={12} style={styles.icon} />
      <div>{props.text}</div>
    </div>
  );
};
