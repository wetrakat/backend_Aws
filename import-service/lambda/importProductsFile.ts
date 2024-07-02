import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { responseHandler } from './utils';

const s3Client = new S3Client({ region: 'eu-west-1' });

const BUCKET = process.env.BUCKET;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(event);

  const fileName = event.queryStringParameters?.name;

  if (!fileName) {
      return responseHandler(400,{ message: "name is required" })
  }

  const params = {
      Bucket: BUCKET,
      Key: `uploaded/${fileName}`,
      Expiration: 60, 
  };

  try {
      const putObjectCommand = new PutObjectCommand(params);
      const signedUrl = await getSignedUrl(s3Client, putObjectCommand);

      return responseHandler(200,{ url: signedUrl })
  } catch (error) {
      return responseHandler(500,{ message: error })
  };
}