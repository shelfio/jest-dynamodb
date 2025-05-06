# jest-dynamodb [![CircleCI](https://circleci.com/gh/shelfio/jest-dynamodb/tree/master.svg?style=svg)](https://circleci.com/gh/shelfio/jest-dynamodb/tree/master) ![](https://img.shields.io/badge/code_style-prettier-ff69b4.svg) [![npm (scoped)](https://img.shields.io/npm/v/@shelf/jest-dynamodb.svg)](https://www.npmjs.com/package/@shelf/jest-dynamodb)

> Jest preset to run DynamoDB Local

## Usage

### 0. Install

```
$ yarn add @shelf/jest-dynamodb --dev
```

Make sure `java` runtime available for running [DynamoDBLocal.jar](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html)

### 1. Create `jest.config.js`

```js
module.exports = {
  preset: '@shelf/jest-dynamodb',
};
```

### 2. Create `jest-dynamodb-config.js`

#### 2.1 Properties

##### tables

- Type: `object[]`
- Required: `true`

Array of createTable params.

- [Create Table API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property).

##### port

- Type: `number`
- Required: `false`

Port number. The default port number is `8000`.

##### hostname

- Type: `string`
- Required: `false`

Hostname. The default hostname is `localhost`.

##### options

- Type: `string[]`
- Required: `false`

Additional arguments for dynamodb-local. The default value is `['-sharedDb']`.

- [dynamodb-local](https://github.com/rynop/dynamodb-local)
- [DynamoDB Local Usage Notes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.UsageNotes.html)

##### clientConfig

- Type: `object`
- Required: `false`

Constructor params of DynamoDB client.

- [Constructor Property](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property)

##### installerConfig

- Type: `{installPath?: string, downloadUrl?: string}`
- Required: `false`

- `installPath` defines the location where dynamodb-local is installed or will be installed.
- `downloadUrl` defines the url of dynamodb-local package.

The default value is defined at https://github.com/rynop/dynamodb-local/blob/2e6c1cb2edde4de0dc51a71c193c510b939d4352/index.js#L16-L19

#### 2.2 Examples

You can set up tables as an object:
 > Whole list of config properties can be found [here](https://github.com/shelfio/jest-dynamodb/blob/6c64dbd4ee5a68230469ea14cbfb814470521197/src/types.ts#L80-L87)
```js
/**
 * @type {import('@shelf/jest-dynamodb/lib').Config}')}
 */
const config = {
  tables: [
    {
      TableName: `files`,
      KeySchema: [{AttributeName: 'id', KeyType: 'HASH'}],
      AttributeDefinitions: [{AttributeName: 'id', AttributeType: 'S'}],
      ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1},
    },
    // etc
  ],
  port: 8000,
};
module.exports = config;
```

Or as an async function (particularly useful when resolving DynamoDB setup dynamically from `serverless.yml`):

```js
module.exports = async () => {
  const serverless = new (require('serverless'))();
  // If using monorepo where DynamoDB serverless.yml is in another directory
  // const serverless = new (require('serverless'))({ servicePath: '../../../core/data' });

  await serverless.init();
  const service = await serverless.variables.populateService();
  const resources = service.resources.filter(r => Object.keys(r).includes('Resources'))[0];

  const tables = Object.keys(resources)
    .map(name => resources[name])
    .filter(r => r.Type === 'AWS::DynamoDB::Table')
    .map(r => r.Properties);

  return {
    tables,
    port: 8000,
  };
};
```

Or read table definitions from a CloudFormation template (example handles a !Sub on TableName, i.e. TableName: !Sub "\${env}-users" ):

```js
const yaml = require('js-yaml');
const fs = require('fs');
const {CLOUDFORMATION_SCHEMA} = require('cloudformation-js-yaml-schema');

module.exports = async () => {
  const cf = yaml.load(fs.readFileSync('../cf-templates/example-stack.yaml', 'utf8'), {
    schema: CLOUDFORMATION_SCHEMA,
  });
  var tables = [];
  Object.keys(cf.Resources).forEach(item => {
    tables.push(cf.Resources[item]);
  });

  tables = tables
    .filter(r => r.Type === 'AWS::DynamoDB::Table')
    .map(r => {
      let table = r.Properties;
      if (typeof r.TableName === 'object') {
        table.TableName = table.TableName.data.replace('${env}', 'test');
      }
      delete table.TimeToLiveSpecification; //errors on dynamo-local
      return table;
    });

  return {
    tables,
    port: 8000,
  };
};
```

Or read table definitions from a CloudFormation template gotten directly from an [AWS CDK Stack](https://docs.aws.amazon.com/cdk/v2/guide/home.html):

```js
const {Template} = require("aws-cdk-lib/assertions");
const {stackWithTables} = require("path/to/stack");

const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const os = require("os");
const path = require("path");

/**
 * @type {import('@shelf/jest-dynamodb/lib').Config}')}
 */

async function jestSetupForDynamoLocal() {

  const template = Template.fromStack(stackWithTables);
  const dynamoDBTablesTemplate = template.findResources(
    dynamodb.CfnGlobalTable.CFN_RESOURCE_TYPE_NAME,
  );

  const tables = Object.values(dynamoDBTablesTemplate).map(Resource => {
    const {Properties = {}} = Resource;

    /**
     * errors on dynamo-local
     */
    if ("TimeToLiveSpecification" in Properties) {
      delete Properties.TimeToLiveSpecification;
    }

    if ("StreamSpecification" in Properties) {
      Properties.StreamSpecification.StreamEnabled = false;
      delete Properties.StreamSpecification.StreamViewType;
    }

    return Properties;
  });

  return {
    tables,
    port: 8000,
    installerConfig: {
      installPath:
        process.env.DYNAMO_DB_LOCAL_INSTALL_PATH ||
          path.join(os.homedir() , "dynamodb_local", "dynamodb_local_latest") ,
    },
  };
}
```

### 3.1 Configure DynamoDB client (from aws-sdk v2)

```js
const {DocumentClient} = require('aws-sdk/clients/dynamodb');

const isTest = process.env.JEST_WORKER_ID;
const config = {
  convertEmptyValues: true,
  ...(isTest && {
    endpoint: 'localhost:8000',
    sslEnabled: false,
    region: 'local-env',
    credentials: {
      accessKeyId: 'fakeMyKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  }),
};

const ddb = new DocumentClient(config);
```

### 3.2 Configure DynamoDB client (from aws-sdk v3)

```js
const {DynamoDB} = require('@aws-sdk/client-dynamodb');
const {DynamoDBDocument} = require('@aws-sdk/lib-dynamodb');

const isTest = process.env.JEST_WORKER_ID;

const ddb = DynamoDBDocument.from(
  new DynamoDB({
    ...(isTest && {
      endpoint: 'http://localhost:8000',
      region: 'local-env',
      credentials: {
        accessKeyId: 'fakeMyKeyId',
        secretAccessKey: 'fakeSecretAccessKey',
      },
    }),
  }),
  {
    marshallOptions: {
      convertEmptyValues: true,
    },
  }
);
```

### 4. PROFIT! Write tests

```js
it('should insert item into table', async () => {
  await ddb.put({TableName: 'files', Item: {id: '1', hello: 'world'}}).promise();

  const {Item} = await ddb.get({TableName: 'files', Key: {id: '1'}}).promise();

  expect(Item).toEqual({
    id: '1',
    hello: 'world',
  });
});
```

## Monorepo Support

By default the `jest-dynamodb-config.js` is read from `cwd` directory, but this might not be suitable for monorepos with nested [jest projects](https://jestjs.io/docs/configuration#projects-arraystring--projectconfig) with nested `jest.config.*` files nested in subdirectories.

If your `jest-dynamodb-config.js` file is not located at `{cwd}/jest-dynamodb-config.js` or you are using nested `jest projects`, you can define the environment variable `JEST_DYNAMODB_CONFIG` with the absolute path of the respective `jest-dynamodb-config.js` file.

### Example Using `JEST_DYNAMODB_CONFIG` in nested project

```
// src/nested/project/jest.config.js
const path = require('path');

// Define path of project level config - extension not required as file will be imported via `require(process.env.JEST_DYNAMODB_CONFIG)`
process.env.JEST_DYNAMODB_CONFIG = path.resolve(__dirname, './jest-dynamodb-config');

module.exports = {
  preset: '@shelf/jest-dynamodb'
  displayName: 'nested-project',
};
```

## Troubleshooting

<details>
<summary>UnknownError: Not Found</summary>

Perhaps something is using your port specified in `jest-dynamodb-config.js`.

</details>

<details>
<summary>com.almworks.sqlite4java.Internal log WARNING: [sqlite] cannot open DB[1]:</summary>

See https://www.josephso.dev/using-jest-dynamodb-in-apple-silicon-platform-workaround/#community-build

</details>

## Alternatives

- [jest-dynalite](https://github.com/freshollie/jest-dynalite) - a much lighter version which spins up an instance for each runner & doesn't depend on Java

## Read

- [dynamodb-local](https://github.com/rynop/dynamodb-local)
- [DynamoDB Local Usage Notes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.UsageNotes.html)
- [Create Table API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property)

## Used by

- [dynamodb-parallel-scan](https://github.com/shelfio/dynamodb-parallel-scan)
- [@nasa-gcn/dynamodb-autoincrement](https://github.com/nasa-gcn/dynamodb-autoincrement)

## See Also

- [jest-mongodb](https://github.com/shelfio/jest-mongodb)

## Publish

```sh
$ git checkout master
$ yarn version
$ yarn publish
$ git push origin master --tags
```

## License

MIT © [Shelf](https://shelf.io)
