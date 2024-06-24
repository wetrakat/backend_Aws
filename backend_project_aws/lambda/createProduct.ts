import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';

import { responseHandler } from './utils';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({ region: 'eu-west-1' });
const dynamoDB = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME;

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
   console.log(event);
    try {
        const { title, description, price, count } = JSON.parse(event.body || '{}');

        if (!title || !description || !price || !count) {
          return responseHandler(500,{message:'need parrams: title, description, description, count'})
        }

        const id = randomUUID();

        const product = {
            id: id,
            title,
            description,
            price
        }

        const stock = {
            product_id: id,
            count: count
        }

        await dynamoDB.send(new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: PRODUCTS_TABLE_NAME,
                        Item: product
                    }
                },
                {
                    Put: {
                        TableName: STOCKS_TABLE_NAME,
                        Item: stock
                    }
                }
            ]
        }));


        return responseHandler(201,product)

    } catch (error) {

        return responseHandler(500,error)
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
