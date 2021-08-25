const {resolve} = require('path');
const cwd = require('cwd');
const {DynamoDB} = require('@aws-sdk/client-dynamodb');
const DynamoDbLocal = require('dynamodb-local');
const debug = require('debug')('jest-dynamodb');
const waitForLocalhost = require('./wait-for-localhost');

// aws-sdk requires access and secret key to be able to call DDB
process.env.AWS_ACCESS_KEY_ID = 'access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'secret-key';

const DEFAULT_PORT = 8000;
const DEFAULT_OPTIONS = ['-sharedDb'];

module.exports = async function () {
  const config = require(process.env.JEST_DYNAMODB_CONFIG ||
    resolve(cwd(), 'jest-dynamodb-config.js'));
  debug('config:', config);
  const {
    tables: newTables,
    clientConfig,
    installerConfig,
    port: port = DEFAULT_PORT,
    options: options = DEFAULT_OPTIONS
  } = typeof config === 'function' ? await config() : config;

  const dynamoDB = new DynamoDB({
    endpoint: `http://localhost:${port}`,
    tls: false,
    region: 'local-env',
    credentials: {
      accessKeyId: 'fakeMyKeyId',
      secretAccessKey: 'fakeSecretAccessKey'
    },
    ...clientConfig
  });

  global.__DYNAMODB_CLIENT__ = dynamoDB;

  try {
    const {TableNames: tableNames} = await Promise.race([
      dynamoDB.listTables({}),
      waitForLocalhost(port)
    ]);
    await deleteTables(dynamoDB, tableNames); // cleanup leftovers
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

async function createTables(dynamoDB, tables) {
  return Promise.all(tables.map(table => dynamoDB.createTable(table)));
}

async function deleteTables(dynamoDB, tableNames) {
  return Promise.all(
    tableNames.map(tableName => dynamoDB.deleteTable({TableName: tableName}).promise())
  );
}
