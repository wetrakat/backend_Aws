import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';

import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';
export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an S3 bucket
    const bucket = s3.Bucket.fromBucketName(
      this,
      'ExistingBucket',
      'mybucketforcsvtask'
    );
    const productsQueue = sqs.Queue.fromQueueArn(
      this,
      'ImportedQueue',
      'arn:aws:sqs:eu-west-1:134877641274:ProjectAwsStack-productQueue20235078-WGt6NUYJCP2m'
    );
    // Create the Lambda function
    const importProductsFile = new lambda.Function(this, 'ImportProductsFile', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'importProductsFile.handler',
      environment: {
        BUCKET: bucket.bucketName,
      },
    });

    bucket.grantPut(importProductsFile);

    importProductsFile.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [`${bucket.bucketArn}/uploaded/*`],
      })
    );
    const importFileParserLambda = new lambda.Function(
      this,
      'ImportFileParser',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('lambda'),
        handler: 'importFileParser.handler',
        environment: {
          BUCKET: bucket.bucketName,
        },
      }
    );

  
    bucket.grantReadWrite(importProductsFile);
    productsQueue.grantSendMessages(importFileParserLambda);
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParserLambda),
      { prefix: 'uploaded/' }
    );
    const api = new apigateway.HttpApi(this, 'HttpApi');

    api.addRoutes({
      path: '/import',
      methods: [apigateway.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('LambdaIntegration', importProductsFile)
    });

    new cdk.CfnOutput(this, 'HTTP', {
      value: api.url ?? 'S'
    });

    new apigateway.HttpStage(this, 'prod', {
      httpApi: api,
      stageName: 'prod',
      autoDeploy: true,
    });
  }
}
