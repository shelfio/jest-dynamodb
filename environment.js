/* eslint-disable no-console */
const {TestEnvironment} = require('jest-environment-node');
const debug = require('debug')('jest-dynamodb');

module.exports = class DynamoDBEnvironment extends TestEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    debug('Setup DynamoDB Test Environment');

    await super.setup();
  }

  async teardown() {
    debug('Teardown DynamoDB Test Environment');

    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
};
