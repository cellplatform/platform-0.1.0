import { t } from '../common';

type Anything = void | any;
type Milliseconds = number;
type Description = string;

export type TestModifier = 'skip' | 'only';

/**
 * BDD ("behavior driven develoment") style test configuration API.
 */
export type Test = {
  describe(description: Description, handler?: TestSuiteHandler): TestSuiteModel;
};

export type TestSuite = {
  timeout(value: Milliseconds): TestSuite;
  describe: TestSuiteDescribe;
  it: TestSuiteIt;
};

export type TestSuiteDescribe = TestSuiteDescribeDef & {
  skip: TestSuiteDescribeDef;
  only: TestSuiteDescribeDef;
};
export type TestSuiteDescribeDef = (
  description: Description,
  handler?: TestSuiteHandler,
) => TestSuiteModel;

export type TestSuiteIt = TestSuiteItDef & { skip: TestSuiteItDef; only: TestSuiteItDef };
export type TestSuiteItDef = (description: Description, handler?: TestHandler) => TestModel;

export type TestSuiteHandler = (e: TestSuite) => Anything | Promise<Anything>;
export type TestHandler = (e: TestHandlerArgs) => Anything | Promise<Anything>;
export type TestHandlerArgs = { timeout(value: Milliseconds): TestHandlerArgs };

/**
 * Model: Test
 */
export type TestModel = {
  run: TestRun;
  description: Description;
  handler?: TestHandler;
  modifier?: TestModifier;
};

export type TestRun = (options?: TestRunOptions) => Promise<TestRunResponse>;
export type TestRunOptions = { timeout?: Milliseconds; skip?: boolean };
export type TestRunResponse = {
  ok: boolean;
  description: Description;
  elapsed: Milliseconds;
  timeout: Milliseconds;
  skipped?: true;
  error?: Error;
};

/**
 * Model: Test Suite
 */

export type TestSuiteModel = TestSuite & {
  state: TestSuiteModelState;
  run: TestSuiteRun;
};

export type TestSuiteModelState = {
  init(): Promise<TestSuiteModel>;
  ready: boolean; // true after [init] has been run.
  description: Description;
  handler?: TestSuiteHandler;
  tests: TestModel[];
  children: TestSuiteModel[];
  timeout?: Milliseconds;
  modifier?: TestModifier;
};

export type TestSuiteRun = (options?: TestSuiteRunOptions) => Promise<TestSuiteRunResponse>;
export type TestSuiteRunOptions = {
  timeout?: number;
  deep?: boolean;
};
export type TestSuiteRunResponse = {
  ok: boolean;
  description: Description;
  elapsed: Milliseconds;
  tests: TestRunResponse[];
  children: TestSuiteRunResponse[];
};
