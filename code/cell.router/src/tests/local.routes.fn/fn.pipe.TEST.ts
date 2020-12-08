import { createMock, expect, fs, Http, t } from '../../test';
import {
  getManifest,
  prepare,
  uploadBundle,
  samples,
  EntryValueSample,
  ResultSample,
} from './util';

describe.only('/fn:run (pipe)', function () {
  this.timeout(99999);

  it.skip('pipe: seqential execution ([list])', async () => {
    //
  });

  it.skip('pipe: parallel execution ({object})', async () => {
    //
  });
});
