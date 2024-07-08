import { SQSEvent, SQSHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const snsClient = new SNSClient({ region: 'eu-west-1' });
const client = new DynamoDBClient({ region: 'eu-west-1' });
const dynamoDB = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME;
const SNS_ARN = process.env.SNS_TOPIC_ARN;

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  console.log('Received SQS event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      const { id, title, description, price, count } = JSON.parse(record.body);

      const newProduct = {
        id: id,
        title,
        description,
        price: Number(price),
      };

      const newStock = {
        product_id: id,
        count: Number(count),
      };

      await dynamoDB.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: PRODUCTS_TABLE_NAME,
                Item: newProduct,
              },
            },
            {
              Put: {
                TableName: STOCKS_TABLE_NAME,
                Item: newStock,
              },
            },
          ],
        })
      );

      const msgSns = {
        Subject: 'New Product Created',
        Message: JSON.stringify({
          product: newProduct,
          stock: newStock,
        }),
        TopicArn: SNS_ARN,
        MessageAttributes: {
          price: {
            DataType: 'Number',
            StringValue: String(price),
          },
        },
      };

      await snsClient.send(new PublishCommand(msgSns));
      console.log(`Product created: ${JSON.stringify(newProduct)}`);
    } catch (error) {
      throw new Error();
    }
  }
};

/* import * as AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  for (const record of event.Records) {
    const body = JSON.parse(record.body);

    // Assume the body contains product data
    const product = {
      id: body.id,
      name: body.name,
      price: body.price,
      // add other product properties here
    };

    const params = {
      TableName: process.env.PRODUCTS_TABLE,
      Item: product
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`Product ${product.id} created successfully`);
    } catch (error) {
      console.error(`Error creating product ${product.id}:`, error);
    }
  }
};
 */
