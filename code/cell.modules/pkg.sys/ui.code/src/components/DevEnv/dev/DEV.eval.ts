'use strict';
import saferEval from 'safer-eval';
import { Test, TestSuiteHandler, TestSuiteRunResponse } from 'sys.ui.dev';

type R = TestSuiteRunResponse;

export function evalCode(code: string) {
  return new Promise<R>((resolve, reject) => {
    const describe = async (name: string, handler: TestSuiteHandler) => {
      const suite = await Test.describe(name, handler).init();
      const results = await suite.run();
      resolve(results);
    };

    const ctx = { describe };
    saferEval(code, ctx);
  });
}
