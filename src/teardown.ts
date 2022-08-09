import DynamoDbLocal from 'dynamodb-local';
import type {JestArgs} from './types';

const debug = require('debug')('jest-dynamodb');

export default async function (jestArgs: JestArgs) {
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

    if (tableNames?.length) {
      await Promise.all(tableNames.map(tableName => dynamoDB.deleteTable({TableName: tableName})));
    }
  }
};
