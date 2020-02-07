const DynamoDbLocal = require('dynamodb-local');
const debug = require('debug')('jest-dynamodb');

module.exports = async function() {
  // eslint-disable-next-line no-console
  debug('Teardown DynamoDB');

  if (global.__DYNAMODB__) {
    await DynamoDbLocal.stopChild(global.__DYNAMODB__);
  } else {
    const dynamoDB = global.__DYNAMODB_CLIENT__;
    const {TableNames: tableNames} = await dynamoDB.listTables().promise();
    await Promise.all(
      tableNames.map(tableName => dynamoDB.deleteTable({TableName: tableName}).promise())
    );
  }
};
