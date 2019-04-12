# jest-dynamodb [![CircleCI](https://circleci.com/gh/shelfio/jest-dynamodb/tree/master.svg?style=svg)](https://circleci.com/gh/shelfio/jest-dynamodb/tree/master) ![](https://img.shields.io/badge/code_style-prettier-ff69b4.svg) [![npm (scoped)](https://img.shields.io/npm/v/@shelf/jest-dynamodb.svg)](https://www.npmjs.com/package/@shelf/jest-dynamodb)

> Jest preset to run DynamoDB Local

## Install

```
$ yarn add @shelf/jest-dynamodb --dev
```

## Usage

### 1. Create `jest.config.js`

```js
module.exports = {
  preset: '@shelf/jest-dynamodb'
};
```

### 2. Create `jest-dynamodb-config.js`

See [Create Table API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property)

```js
module.exports = {
  tables: [
    {
      TableName: `files`,
      KeySchema: [{AttributeName: 'id', KeyType: 'HASH'}],
      AttributeDefinitions: [{AttributeName: 'id', AttributeType: 'S'}],
      ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1}
    }
    // etc
  ]
};
```

### 3. Configure DynamoDB client

```js
const {DocumentClient} = require('aws-sdk/clients/dynamodb');

const isTest = process.env.JEST_WORKER_ID;
const config = {
  convertEmptyValues: true,
  ...(isTest && {endpoint: 'localhost:8000', sslEnabled: false, region: 'local-env'})
};

const ddb = new DocumentClient(config);
```

### 4. PROFIT! Write tests

```js
it('should insert item into table', async () => {
  await ddb.put({TableName: 'files', Item: {id: '1', hello: 'world'}}).promise();

  const {Item} = await ddb.get({TableName: 'files', Key: {id: '1'}}).promise();

  expect(Item).toEqual({
    id: '1',
    hello: 'world'
  });
});
```

## Read

- [dynamodb-local](https://github.com/rynop/dynamodb-local)
- [DynamoDB Local Usage Notes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.UsageNotes.html)
- [Create Table API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property)

## License

MIT © [Shelf](https://shelf.io)
