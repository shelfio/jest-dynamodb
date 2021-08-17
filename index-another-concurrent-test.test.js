const {DynamoDB} = require('@aws-sdk/client-dynamodb');
const {DynamoDBDocument} = require('@aws-sdk/lib-dynamodb');

const ddb = DynamoDBDocument.from(
  new DynamoDB({
    endpoint: 'http://localhost:8000',
    tls: false,
    region: 'local-env'
  }),
  {
    marshallOptions: {
      convertEmptyValues: true
    }
  }
);

it('should insert item into another table concurrently', async () => {
  await ddb.put({TableName: 'users', Item: {id: '1', hello: 'world'}});

  const {Item} = await ddb.get({TableName: 'users', Key: {id: '1'}});

  expect(Item).toEqual({
    id: '1',
    hello: 'world'
  });
});
