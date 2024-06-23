import * as AWS from 'aws-sdk';
import { responseHandler } from './utils';
import { APIGatewayProxyEvent } from 'aws-lambda';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const PRODUCTS_TABLE_NAME: string = process.env.PRODUCTS_TABLE_NAME!;
const STOCKS_TABLE_NAME: string = process.env.STOCKS_TABLE_NAME!;
import {v4}  from 'uuid';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log(event);
  const body = JSON.parse(event.body || "{}");
  const { title, description, price, count=0 } = body
  const id = v4();

  const productParams = {
    TableName: PRODUCTS_TABLE_NAME,
    Item: { id, title, description, price },
  };

  const stockParams = {
    TableName: STOCKS_TABLE_NAME,
    Item: { product_id: id, count },
  };

  try {
   
    const transactParams: AWS.DynamoDB.DocumentClient.TransactWriteItemsInput =
      {
        TransactItems: [{ Put: productParams }, { Put: stockParams }],
      };

    await dynamoDB.transactWrite(transactParams).promise();
    return responseHandler(201, { message: "Product created successfully" });
  } catch (error) {
    return responseHandler(500, error);
  }
};
 /*  const { title, description, price, count } = JSON.parse(event.body || '{}');
  const id = v4();

  const productParams = {
    TableName: PRODUCTS_TABLE_NAME,
    Item: { id, title, description, price },
  };

  const stockParams = {
    TableName: PRODUCTS_TABLE_NAME,
    Item: { product_id: id, count },
  }; 

  try {
    const { title, description, price, count } = JSON.parse(event.body!);

    const id = v4();

    const product = {
      id,
      title,
      description,
      price,
    };

    const stock = {
      id,
      count,
    };

    await dynamoDB.send(new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: PRODUCTS_TABLE_NAME,
              Item: product,
            },
          },
          {
            Put: {
              TableName: STOCKS_TABLE_NAME,
              Item: stock,
            },
          },
        ],
      }))
    return responseHandler(201, { message: 'Product created successfully' });
  } catch (error) {
    return responseHandler(500, error);
  }
};

 try {
  const { title, description, price, count } = JSON.parse(event.body!);

  const id = v4();

  const product = {
    id,
    title,
    description,
    price,
  };

  const stock = {
    id,
    count,
  };

  await dynamoDB
    .transactWrite({
      TransactItems: [
        {
          Put: {
            TableName: PRODUCTS_TABLE_NAME,
            Item: product,
          },
        },
        {
          Put: {
            TableName: STOCKS_TABLE_NAME,
            Item: stock,
          },
        },
      ],
    })
    .promise();
  return responseHandler(201,product)
} catch (error) {
  return {
    statusCode: 500,
    body: JSON.stringify({ error: 'Could not create product' })
  };
} 
 */