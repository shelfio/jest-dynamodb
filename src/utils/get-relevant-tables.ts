import type {CreateTableCommandInput} from '@aws-sdk/client-dynamodb';

export default function getRelevantTables(
  dbTables: string[],
  configTables: CreateTableCommandInput[]
) {
  const configTableNames = configTables.map(configTable => configTable.TableName);

  return dbTables.filter(dbTable => configTableNames.includes(dbTable));
}
