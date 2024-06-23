import { DynamoDB } from 'aws-sdk';
import AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';
AWS.config.update({region: 'eu-west-1'});

const dynamoDB = new DynamoDB.DocumentClient();

const products = [
  {
    title: 'Product 1',
    description: 'Description 1',
    price: 100,
  },
  {
    title: 'Product 2',
    description: 'Description 2',
    price: 200,
  },
  {
    title: 'Product 3',
    description: 'Description 3',
    price: 300,
  },
];

async function putItemInTable(tableName: string, item: any) {
  const params = {
    TableName: tableName,
    Item: item,
  };

  try {
    await dynamoDB.put(params).promise();
    console.log(`Inserted item into ${tableName}`);
  } catch (error) {
    console.error(`Error inserting item into ${tableName}`, error);
  }
}

async function fillTables() {
  for (const product of products) {
    const id = uuidv4();
    await putItemInTable('products', { id, ...product });
    await putItemInTable('stocks', { product_id: id, count: 10 });
  }
}

fillTables().catch(console.error);
