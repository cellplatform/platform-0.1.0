import React, { useState } from 'react';

import {
  Button,
  Color,
  COLORS,
  css,
  CssValue,
  Filesystem,
  Http,
  ModuleInfo,
  Spinner,
  t,
  Vercel,
  FC,
} from './common';

export type DeployProps = {
  instance: t.FsViewInstance;
  dir?: string;
  token?: string;
  team?: string;
  domain?: string;
  project?: string;
  style?: CssValue;
};

/**
 * TODO 🐷
 * - Refactor into sub-modules
 * - Do not require HTTP to be passed to Vercel (make it optional)
 * - Deploying message - update with details
 * - Generate [Manifests] before deploy
 * - Display response in <CardStack>
 * - Stack up and store list of deployments in .log file (within FS)
 * - "Filesystem ID" within <PropsList>
 * - Read <Manifest.json> file and display details in <PropList>
 *    - namespace
 *    - version
 *    - [etc]
 */

/**
 * Component
 */
const View: React.FC<DeployProps> = (props) => {
  const { instance, token, team, project, domain, dir } = props;
  const bus = instance.bus;
  const canDeploy = Boolean(token && project && team);

  const [isDeploying, setDeploying] = useState(false);
  const [response, setResponse] = useState<t.VercelHttpDeployResponse>();

  /**
   * Handlers
   */
  const handleDeployClick = async () => {
    if (isDeploying || !canDeploy) return;
    if (!(token && project && team)) return;
    setDeploying(true);

    const alias = domain;
    const headers = { Authorization: `Bearer ${token}` };
    const http = Http.create({ headers });
    const fs = Filesystem.Events({ bus, id: instance.fs }).fs({ dir });

    const deployment = Vercel.Deploy({
      http,
      fs,
      token,
      team,
      project,
      async beforeUpload(e) {
        console.log('beforeUpload', e);
      },
    });

    const info = await deployment.info();
    console.log('info', info);
    console.log('info.size.toString()', info.files.size.toString());
    console.log('-------------------------------------------');

    /**
     * COMMIT (DEPLOY)
     */
    const res = await deployment.commit(
      {
        target: alias ? 'production' : 'staging',
        regions: ['sfo1'],
        alias,
      },
      { ensureProject: true },
    );

    /**
     * OUTPUT
     */
    const { status } = res;
    const { name, urls } = res.deployment;

    console.log('res', res);
    console.log('-------------------------------------------');
    console.log(status);
    console.log(name);
    console.log(' • ', urls.inspect);
    urls.public.forEach((url) => console.log(' • ', url));
    if (res.error) console.log('error', res.error);
    console.log();

    // Finish up.
    setResponse(res);
    setDeploying(false);
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      Flex: 'y-stretch-stretch',
      minWidth: 350,
      color: COLORS.DARK,
    }),
    fs: {
      base: css({
        height: 180,
        backgroundColor: Color.format(0.3),
        backdropFilter: `blur(8px)`,
        border: `solid 1px ${Color.format(-0.1)}`,
        borderRadius: 3,
        display: 'flex',
      }),
      list: css({ flex: 1 }),
    },
    controls: {
      base: css({
        Flex: 'x-stretch-stretch',
        marginTop: 8,
        PaddingX: 20,
      }),
      edge: css({ width: 20 }),
      center: css({
        flex: 1,
        Flex: 'y-stretch-stretch',
      }),
      hr: css({
        borderBottom: `solid 5px ${Color.format(-0.1)}`,
        MarginY: 12,
      }),
      footerBar: css({
        Flex: 'x-spaceBetween-center',
        fontSize: 14,
        height: 22,
      }),
      message: css({
        fontSize: 12,
        fontStyle: 'italic',
        opacity: 0.4,
      }),
    },
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.fs.base}>
        <Filesystem.PathList.Stateful
          instance={instance}
          style={styles.fs.list}
          scrollable={true}
          droppable={true}
          selectable={true}
        />
      </div>
      <div {...styles.controls.base}>
        <div {...styles.controls.edge} />
        <div {...styles.controls.center}>
          <ModuleInfo
            fields={['Token.API.Hidden', 'Deploy.Team', 'Deploy.Project', 'Deploy.Domain']}
            data={{ token, deploy: { team, project, domain } }}
            style={{ flex: 1 }}
          />

          {response && <div {...styles.controls.hr} />}
          {response && (
            <ModuleInfo
              fields={['Deploy.Response']}
              data={{ token, deploy: { response } }}
              style={{ flex: 1 }}
            />
          )}

          <div {...styles.controls.hr} />
          <div {...styles.controls.footerBar}>
            <div>{isDeploying && <div {...styles.controls.message}>Deploying...</div>}</div>
            {isDeploying && <Spinner size={18} color={COLORS.DARK} />}
            {!isDeploying && (
              <Button isEnabled={canDeploy} onClick={handleDeployClick} label={'Deploy'} />
            )}
          </div>
        </div>
        <div {...styles.controls.edge} />
      </div>
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  //
};
export const Deploy = FC.decorate<DeployProps, Fields>(View, {}, { displayName: 'Deploy' });
