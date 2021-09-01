import { t } from '../common';

/**
 * TODO 🐷 (Work In Progress.)
 */

/**
 * BDD ("behavior driven develoment") style test configuration API.
 */

export type Test = {
  describe(description: string, fn: TestSuiteHandler): void;
};

export type TestSuite = {
  describe(description: string, fn: TestSuiteHandler): TestSuite;
};

export type TestSuiteHandler = (e: TestSuite) => void;
