/* eslint-disable no-console */
const NodeEnvironment = require('jest-environment-node');

module.exports = class DynamoDBEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    console.log('Setup DynamoDB Test Environment');

    await super.setup();
  }

  async teardown() {
    console.log('Teardown DynamoDB Test Environment');

    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
};
