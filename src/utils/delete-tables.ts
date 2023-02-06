import type {DynamoDB} from '@aws-sdk/client-dynamodb';

export default function deleteTables(dynamoDB: DynamoDB, tableNames: string[]) {
  return Promise.all(tableNames.map(tableName => dynamoDB.deleteTable({TableName: tableName})));
}
