const {resolve} = require('path');
const cwd = require('cwd');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DynamoDbLocal = require('dynamodb-local');

// aws-sdk requires access and secret key to be able to call DDB
process.env.AWS_ACCESS_KEY_ID = 'access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'secret-key';

const DEFAULT_PORT = 8000;
const DEFAULT_OPTIONS = ['-sharedDb'];

module.exports = async function() {
  const config = require(resolve(cwd(), 'jest-dynamodb-config.js'));
  const {tables, port: port = DEFAULT_PORT, options: options = DEFAULT_OPTIONS} =
    typeof config === 'function' ? await config() : config;
  const dynamoDB = new DynamoDB({
    endpoint: `localhost:${port}`,
    sslEnabled: false,
    region: 'local-env',
    logger: console
  });

  const verbose = true;

  global.__DYNAMODB__ = await DynamoDbLocal.launch(port, null, options, verbose);

  await createTables(dynamoDB, tables);
};

async function createTables(dynamoDB, tables) {
  return Promise.all(tables.map(table => dynamoDB.createTable(table).promise()));
}
