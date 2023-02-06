import DynamoDbLocal from 'dynamodb-local';
import type {JestArgs} from './types';
import deleteTables from './utils/delete-tables';
import getConfig from './utils/get-config';
import getRelevantTables from './utils/get-relevant-tables';

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
    const {tables: targetTables} = await getConfig(debug);

    const {TableNames: tableNames} = await dynamoDB.listTables({});

    if (tableNames?.length) {
      await deleteTables(dynamoDB, getRelevantTables(tableNames, targetTables));
    }
  }
}
