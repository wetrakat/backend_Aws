import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
const s3Client = new S3Client({ region: 'eu-west-1' });
import * as csv from 'csv-parser';
import { Readable } from 'stream';
const BUCKET = process.env.BUCKET;
const sqsClient = new SQSClient({ region: 'eu-west-1' });

const URL_SQS =
  'https://sqs.eu-west-1.amazonaws.com/134877641274/ProjectAwsStack-productQueue20235078-WGt6NUYJCP2m';

exports.handler = async (event: any) => {
  const bucket = BUCKET;
  const objKey = event.Records[0].s3.object.key;

  // Ensure this function only triggers for changes in the 'uploaded' folder
  if (!objKey.startsWith('uploaded/')) {
    return;
  }

  const arr: any[] = [];
  try {
    const params = {
      Bucket: bucket,
      Key: objKey,
    };
    const getObjectCommand = new GetObjectCommand(params);
    const { Body } = await s3Client.send(getObjectCommand);

    if (!Body || !(Body instanceof Readable)) {
      throw new Error();
    }

    Body.pipe(csv())
      .on('data', async (data: any) => {
        console.log(data);
        arr.push(data);
      })
      .on('end', async () => {
        try {
          console.log('csv parsed ');

          await Promise.all(arr.map(async (record) => {
            const sendMessageCommand = new SendMessageCommand({
                QueueUrl: URL_SQS,
                MessageBody: JSON.stringify(record)
            });
                await sqsClient.send(sendMessageCommand);
        }));

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

          console.log('move to parsed');
        } catch (err) {
          console.log(err);
          throw new Error();
        }
      });
  } catch (error) {
    throw error;
  }
};
