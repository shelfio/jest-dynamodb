const {DynamoDB} = require('@aws-sdk/client-dynamodb');
const {DynamoDBDocument} = require('@aws-sdk/lib-dynamodb');

const ddb = DynamoDBDocument.from(
  new DynamoDB({
    endpoint: 'http://localhost:8000',
    tls: false,
    region: 'local-env',
    credentials: {
      accessKeyId: 'fakeMyKeyId',
      secretAccessKey: 'fakeSecretAccessKey'
    }
  }),
  {
    marshallOptions: {
      convertEmptyValues: true
    }
  }
);

it('should insert item into table', async () => {
  await ddb.put({TableName: 'files', Item: {id: '1', hello: 'world'}});

  const {Item} = await ddb.get({TableName: 'files', Key: {id: '1'}});

  expect(Item).toEqual({
    id: '1',
    hello: 'world'
  });
});
