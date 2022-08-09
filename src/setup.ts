import type {ListTablesCommandOutput} from '@aws-sdk/client-dynamodb/dist-types/commands/ListTablesCommand';
import type {argValues} from 'dynamodb-local';
import DynamoDbLocal from 'dynamodb-local';
import {resolve} from 'path';
import cwd from 'cwd';
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import type {CreateTableCommandInput} from '@aws-sdk/client-dynamodb';
import type {Config} from './types';
import waitForLocalhost from './utils/wait-for-localhost';

const debug = require('debug')('jest-dynamodb');

const DEFAULT_PORT = 8000;
const DEFAULT_OPTIONS: argValues[] = ['-sharedDb'];

module.exports = async function () {
  const {
    tables: newTables,
    clientConfig,
    installerConfig,
    port: port = DEFAULT_PORT,
    options: options = DEFAULT_OPTIONS,
  } = await getConfig();

  const dynamoDB = new DynamoDB({
    endpoint: `http://localhost:${port}`,
    tls: false,
    region: 'local-env',
    credentials: {
      accessKeyId: 'fakeMyKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
    ...clientConfig,
  });

  global.__DYNAMODB_CLIENT__ = dynamoDB;

  try {
    const promises: (Promise<ListTablesCommandOutput> | Promise<void>)[] = [
      dynamoDB.listTables({}),
    ];

    if (!global.__DYNAMODB__) {
      promises.push(waitForLocalhost(port));
    }

    const [TablesList] = await Promise.all(promises);
    const tableNames = TablesList?.TableNames;

    if (tableNames) {
      await deleteTables(dynamoDB, tableNames);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    debug(`fallback to launch DB due to ${err}`);

    if (installerConfig) {
      DynamoDbLocal.configureInstaller(installerConfig);
    }

    if (!global.__DYNAMODB__) {
      debug('spinning up a local ddb instance');

      global.__DYNAMODB__ = await DynamoDbLocal.launch(port, null, options);
      debug(`dynamodb-local started on port ${port}`);

      await waitForLocalhost(port);
    }
  }
  debug(`dynamodb-local is ready on port ${port}`);

  await createTables(dynamoDB, newTables);
};

function createTables(dynamoDB: DynamoDB, tables: CreateTableCommandInput[]) {
  return Promise.all(tables.map(table => dynamoDB.createTable(table)));
}

function deleteTables(dynamoDB: DynamoDB, tableNames: string[]) {
  return Promise.all(tableNames.map(tableName => dynamoDB.deleteTable({TableName: tableName})));
}

async function getConfig(): Promise<Config> {
  const path = process.env.JEST_DYNAMODB_CONFIG || resolve(cwd(), 'jest-dynamodb-config.js');
  const config = require(path);
  debug('config:', config);

  return typeof config === 'function' ? await config() : config;
}
