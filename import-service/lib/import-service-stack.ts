import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   
  // Create an S3 bucket
  const bucket = new s3.Bucket(this, 'ProductBucket');

  // Create the Lambda function
  const importProductsFile = new lambda.Function(this, 'ImportProductsFile', {
    runtime: lambda.Runtime.NODEJS_20_X,
    code: lambda.Code.fromAsset('lambda'),
    handler: 'importProductsFile.handler',
    environment: {
      BUCKET: bucket.bucketName
    },
  });

  // Allow the Lambda function to interact with S3
  bucket.grantReadWrite(importProductsFile);

  // Create the API Gateway with a GET endpoint
  const api = new apigateway.RestApi(this, 'ProductApi');
  const importProducts = api.root.addResource('import');
  const getIntegration = new apigateway.LambdaIntegration(importProductsFile);
  importProducts.addMethod('GET', getIntegration);
  }
}
