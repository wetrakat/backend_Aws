import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';
export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an S3 bucket
    const bucket = s3.Bucket.fromBucketName(
      this,
      'ExistingBucket',
      'mybucketforcsvtask'
    );

    // Create the Lambda function
    const importProductsFile = new lambda.Function(this, 'ImportProductsFile', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'importProductsFile.handler',
      environment: {
        BUCKET: bucket.bucketName,
      },
    });

    bucket.grantPut(importProductsFile);



    importProductsFile.addToRolePolicy(new iam.PolicyStatement({
      actions: ['s3:PutObject'],
      resources: [`${bucket.bucketArn}/uploaded/*`]
    }));
    const importFileParser = new lambda.Function(this, 'ImportFileParser', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'importFileParser.handler',
      environment: {
        BUCKET: bucket.bucketName,
      },
    });

    // Allow the Lambda function to interact with S3
    bucket.grantReadWrite(importProductsFile);

    
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParser),
      { prefix: 'uploaded/' }
    );

    // Create the API Gateway with a GET endpoint
    const api = new apigateway.RestApi(this, 'ProductApiCSV');
    const importProducts = api.root.addResource('import');
    const getIntegration = new apigateway.LambdaIntegration(importProductsFile);
    importProducts.addMethod('GET', getIntegration);


    new cdk.CfnOutput(this, ' URL', {
      value: api.url ?? 'error  deploy'
    });

  }
}
