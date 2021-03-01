const {DocumentClient} = require('aws-sdk/clients/dynamodb');

const ddb = new DocumentClient({
  convertEmptyValues: true,
  endpoint: 'localhost:8000',
  sslEnabled: false,
  region: 'local-env'
});

it('should insert item into another table concurrently', async () => {
  await ddb.put({TableName: 'users', Item: {id: '1', hello: 'world'}}).promise();

  const {Item} = await ddb.get({TableName: 'users', Key: {id: '1'}}).promise();

  expect(Item).toEqual({
    id: '1',
    hello: 'world'
  });
});
