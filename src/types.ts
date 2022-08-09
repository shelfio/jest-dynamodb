/* eslint-disable */
import type {DynamoDB} from '@aws-sdk/client-dynamodb';
import type {CreateTableCommandInput} from '@aws-sdk/client-dynamodb';
import type {DynamoDBClientConfig} from '@aws-sdk/client-dynamodb';
import type {ChildProcess} from 'child_process';
import type {InstallerConfig} from 'dynamodb-local';
import type {argValues} from 'dynamodb-local';

declare global {
  var __DYNAMODB_CLIENT__: DynamoDB;
  var __DYNAMODB__: ChildProcess;
}

export type JestArgs = {
  bail: number;
  changedSince?: string;
  changedFilesWithAncestor: boolean;
  ci: boolean;
  collectCoverage: boolean;
  collectCoverageFrom: Array<string>;
  collectCoverageOnlyFrom?: {
    [key: string]: boolean;
  };
  coverageDirectory: string;
  coveragePathIgnorePatterns?: Array<string>;
  coverageProvider: object;
  coverageReporters: object;
  coverageThreshold?: object;
  detectLeaks: boolean;
  detectOpenHandles: boolean;
  expand: boolean;
  filter?: string;
  findRelatedTests: boolean;
  forceExit: boolean;
  json: boolean;
  globalSetup?: string;
  globalTeardown?: string;
  lastCommit: boolean;
  logHeapUsage: boolean;
  listTests: boolean;
  maxConcurrency: number;
  maxWorkers: number;
  noStackTrace: boolean;
  nonFlagArgs: Array<string>;
  noSCM?: boolean;
  notify: boolean;
  notifyMode: object;
  outputFile?: string;
  onlyChanged: boolean;
  onlyFailures: boolean;
  passWithNoTests: boolean;
  projects: Array<string>;
  replname?: string;
  reporters?: Array<object>;
  runTestsByPath: boolean;
  rootDir: string;
  shard?: object;
  silent?: boolean;
  skipFilter: boolean;
  snapshotFormat: object;
  errorOnDeprecated: boolean;
  testFailureExitCode: number;
  testNamePattern?: string;
  testPathPattern: string;
  testResultsProcessor?: string;
  testSequencer: string;
  testTimeout?: number;
  updateSnapshot: object;
  useStderr: boolean;
  verbose?: boolean;
  watch: boolean;
  watchAll: boolean;
  watchman: boolean;
  watchPlugins?: Array<{
    path: string;
    config: Record<string, unknown>;
  }> | null;
};

export type Config = {
  tables: CreateTableCommandInput[];
  clientConfig?: DynamoDBClientConfig;
  installerConfig: InstallerConfig;
  port: number;
  options: argValues[];
};
