const {resolve} = require('path');
const cwd = require('cwd');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DynamoDbLocal = require('dynamodb-local');
const defaultPort = 8000;
let {port} = require(resolve(cwd(), 'jest-dynamodb-config.js'));
if (typeof port === 'undefined' || port === null) {
  port = defaultPort;
}

// aws-sdk requires access and secret key to be able to call DDB
process.env.AWS_ACCESS_KEY_ID = 'access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'secret-key';

const dynamoDB = new DynamoDB({
  endpoint: 'localhost:' + port,
  sslEnabled: false,
  region: 'local-env'
});

module.exports = async function() {
  global.__DYNAMODB__ = await DynamoDbLocal.launch(port, null, ['-sharedDb']);

  await createTables();
};

async function createTables() {
  const {tables} = require(resolve(cwd(), 'jest-dynamodb-config.js'));

  return Promise.all(tables.map(table => dynamoDB.createTable(table).promise()));
}
