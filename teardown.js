const DynamoDbLocal = require('dynamodb-local');

module.exports = async function() {
  // eslint-disable-next-line no-console
  console.log('Teardown DynamoDB');
  await DynamoDbLocal.stopChild(global.__DYNAMODB__);
};
