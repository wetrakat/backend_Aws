import { SQSEvent, SQSHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { randomUUID } from 'crypto';

const snsClient = new SNSClient({ region: 'eu-west-1' });
const client = new DynamoDBClient({ region: 'eu-west-1' });
const dynamoDB = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME;
const SNS_ARN = process.env.SNS_TOPIC_ARN;

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {

  for (const record of event.Records) {
      try {
          const { title, description, price, count } = JSON.parse(record.body);

       

          const productId = randomUUID();

          const newProduct = {
              id: productId,
              title,
              description,
              price: Number(price)
          };

          const newStock = {
              product_id: productId,
              count: Number(count)
          };

          await dynamoDB.send(new TransactWriteCommand({
              TransactItems: [
                  {
                      Put: {
                          TableName: PRODUCTS_TABLE_NAME,
                          Item: newProduct
                      }
                  },
                  {
                      Put: {
                          TableName: STOCKS_TABLE_NAME,
                          Item: newStock
                      }
                  }
              ]
          }));

          const snsMessage = {
              Subject: 'Created',
              Message: JSON.stringify({
                  product: newProduct,
                  stock: newStock
              }),
              TopicArn: SNS_ARN,
              MessageAttributes: {
                  price: {
                    DataType: 'Number',
                    StringValue: String(price)
                  }
                }
          };

          await snsClient.send(new PublishCommand(snsMessage));
          console.log(`created: ${JSON.stringify(newProduct)}`);
      } catch (error) {
          console.error("Error:", error);
      };
  };
};
