import { t, fs, http } from '../common';

import { crypto } from './crypto';

// https://dev.db.team/cell:ckhon6cdk000o6hetdrtmd0dt:A1/file/sample/index.json

export const tmpHandler: t.RouteHandler = async (req) => {
  const length = 30;
  const random = await crypto.random(length);

  const url = 'https://dev.db.team/cell:ckhon6cdk000o6hetdrtmd0dt:A1/file/sample/index.json';

  const res = await http.get(url);
  console.log('res', res);

  return {
    status: 200,
    data: {
      random,
      res,
    },
  };
};
