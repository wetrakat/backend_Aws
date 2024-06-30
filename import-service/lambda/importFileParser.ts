import * as AWS from 'aws-sdk';
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent } from 'aws-lambda';
const s3 = new AWS.S3({ region: 'eu-west-1' });
const s3Client = new S3Client({ region: 'eu-west-1' });
import csv from 'csv-parser';
import { Readable } from 'stream';
const BUCKET = process.env.BUCKET;

exports.handler = async (event: any) => {
  const bucket = BUCKET;
  const objKey = event.Records[0].s3.object.key;

  // Ensure this function only triggers for changes in the 'uploaded' folder
  if (!objKey.startsWith('uploaded/')) {
    return;
  }

  const arr = [];
  try {
    const params = {
      Bucket: bucket,
      Key: objKey,
    };
    const getObjectCommand = new GetObjectCommand(params);
    const { Body} = await s3Client.send(getObjectCommand);

    if (!Body || !(Body instanceof Readable)) {
      throw new Error;
    }

    Body.pipe(csv())
      .on('data', (data: any) => {
        console.log(data);
        arr.push(data);
      })
      .on('end', async () => {
        try {
          console.log('сым parsed ');

          const objCopy = {
            Bucket: bucket,
            CopySource: `${bucket}/${objKey}`,
            Key: objKey.replace('uploaded/', 'parsed/'),
          };

          const copyObjectCommand = new CopyObjectCommand(objCopy);
          await s3Client.send(copyObjectCommand);

          const objDelete = new DeleteObjectCommand({
            Bucket: bucket,
            Key: objKey,
          });
          await s3Client.send(objDelete);

          console.log(
            'move to parsed'
          );
        } catch (err) {
          console.log(err);
          throw new Error();
        }
      });
  } catch (error) {
    console.error(`Error processing file ${objKey}: `, error);
    throw error;
  }
};
