const DynamoDbLocal = require('dynamodb-local');
const debug = require('debug')('jest-dynamodb');

module.exports = async function (jestArgs) {
  // eslint-disable-next-line no-console
  debug('Teardown DynamoDB');

  if (global.__DYNAMODB__) {
    const watching = jestArgs.watch || jestArgs.watchAll;

    if (!watching) {
      await DynamoDbLocal.stopChild(global.__DYNAMODB__);
    }
  } else {
    const dynamoDB = global.__DYNAMODB_CLIENT__;
    const {TableNames: tableNames} = await dynamoDB.listTables({});
    await Promise.all(tableNames.map(tableName => dynamoDB.deleteTable({TableName: tableName})));
  }
};
