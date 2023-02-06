/* eslint-disable no-console */
import {TestEnvironment} from 'jest-environment-node';
import type {EnvironmentContext} from '@jest/environment';
import type {JestEnvironmentConfig} from '@jest/environment';

const debug = require('debug')('jest-dynamodb');

module.exports = class DynamoDBEnvironment extends TestEnvironment {
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
  }

  async setup() {
    debug('Setup DynamoDB Test Environment');

    await super.setup();
  }

  async teardown() {
    debug('Teardown DynamoDB Test Environment');

    await super.teardown();
  }

  // @ts-ignore
  runScript(script) {
    // @ts-ignore
    return super.runScript(script);
  }
};
