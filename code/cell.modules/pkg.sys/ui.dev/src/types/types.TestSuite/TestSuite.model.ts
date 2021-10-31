import { t } from '../common';

type Id = string;
type Anything = void | any;
type Milliseconds = number;
type Description = string;
type BundleImport = TestSuiteModel | Promise<any>;

export type TestModifier = 'skip' | 'only';

/**
 * BDD ("behavior driven develoment") style test configuration API.
 */
export type Test = {
  describe: TestSuiteDescribe;
  bundle(items: BundleImport | BundleImport[]): Promise<TestSuiteModel>;
  bundle(description: string, items: BundleImport | BundleImport[]): Promise<TestSuiteModel>;
};

/**
 * A suite ("set") of tests.
 */
export type TestSuite = {
  id: Id;
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
  kind: 'Test';
  parent: TestSuiteModel;
  id: Id;
  run: TestRun;
  description: Description;
  handler?: TestHandler;
  modifier?: TestModifier;
  toString(): string;
};

export type TestRun = (options?: TestRunOptions) => Promise<TestRunResponse>;
export type TestRunOptions = { timeout?: Milliseconds; excluded?: TestModifier[] };
export type TestRunResponse = {
  ok: boolean;
  description: Description;
  elapsed: Milliseconds;
  timeout: Milliseconds;
  excluded?: TestModifier[];
  error?: Error;
};

/**
 * Model: Test Suite
 */

export type TestSuiteModel = TestSuite & {
  kind: 'TestSuite';
  state: TestSuiteModelState;
  run: TestSuiteRun;
  merge(...suites: TestSuiteModel[]): TestSuiteModel;
  init(): Promise<TestSuiteModel>;
  toString(): string;
};

export type TestSuiteModelState = {
  parent?: TestSuiteModel;
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
