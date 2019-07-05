const DynamoDbLocal = require('dynamodb-local');
const debug = require('debug')('jest-dynamodb');

module.exports = async function() {
  // eslint-disable-next-line no-console
  debug('Teardown DynamoDB');
  await DynamoDbLocal.stopChild(global.__DYNAMODB__);
};
