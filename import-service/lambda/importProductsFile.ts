import { APIGatewayProxyEvent } from 'aws-lambda';
import * as AWS from "aws-sdk";
const s3 = new AWS.S3();
const BUCKET = process.env.BUCKET;

exports.handler = async (event: APIGatewayProxyEvent) => {
  const fileName = event.queryStringParameters?.name;
  const params = {
    Bucket: BUCKET,
    Key: `uploaded/${fileName}`,
    Expires: 60,
    ContentType: 'text/csv',
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', params, (err: Error, url: string) => {
      if (err) reject(err);
      else
        resolve({
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: url,
        });
    });
  });
};
