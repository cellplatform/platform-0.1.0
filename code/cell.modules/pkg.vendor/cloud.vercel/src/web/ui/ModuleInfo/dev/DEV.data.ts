import { t } from '../../common';

const DEPLOYMENT_RESPONSE: t.VercelHttpDeployResponse = {
  ok: true,
  status: 200,
  deployment: {
    id: 'dpl_8i6gBi1xsgM3ywoGAtNNxitYojNE',
    name: 'unnamed-v0.0.0',
    team: { name: 'myteam', id: 'team_XiTEFdEddC2YnK7jY9EGICrW' },
    project: { name: 'foobar', id: 'prj_NS43AQvOXywWILrDyRe3HVqmkHPx' },
    target: 'production',
    regions: ['sfo1'],
    alias: ['tmp-deploy.db.team'],
    meta: {
      kind: 'bundle:plain/files',
      version: '0.0.0',
      fileshash: 'sha256-b8e1a641f0e999c10274cfda947e6cefbf526bc9cdabdeeff613d38904e3c9c2',
      bytes: '1610',
    },
    urls: {
      inspect: 'https://vercel.com/foo/unnamed-v0.0.0/8i6gBi1WsgS3ywuGAtxNxitYojNE',
      public: ['https://foo-oug60b2sk-tdb.vercel.app', 'https://foo.domain.com'],
    },
    bytes: 1610,
    elapsed: 1369,
  },
  paths: ['my-file-2.json', 'index.json'],
};

export const SAMPLE = {
  deployment: {
    response: DEPLOYMENT_RESPONSE,
  },
};
