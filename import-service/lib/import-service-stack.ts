import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
0
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
      'arn:aws:sqs:eu-west-1:134877641274:ProjectAwsStack-productQueue20235078-1sNOBMf4eoL7'
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







    const authorizer = new apigateway.TokenAuthorizer(this, "LambdaAuthorizer", {
      handler: lambda.Function.fromFunctionArn(
        this,
        "authfunc",
        cdk.Fn.importValue("BasicAuthorizerFunctionArn")
      ),
      identitySource: apigateway.IdentitySource.header("Authorization"),
    });

    const api = new apigateway.RestApi(this, "importApi", {
      restApiName: "Import Service",
      cloudWatchRole: true,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-Amz-Security-Token",
        ],
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const importProductsFileResource = api.root.addResource("import");

    const importProductsFileLambdaIntegration =
      new apigateway.LambdaIntegration(importProductsFile, {
        proxy: true,
      });

      const commonResponseParameters = {
        "method.response.header.Access-Control-Allow-Origin": true,
        "method.response.header.Access-Control-Allow-Headers": true,
        "method.response.header.Access-Control-Allow-Methods": true,
      };
      
      // Add method with optimized configuration
      importProductsFileResource.addMethod("GET", importProductsFileLambdaIntegration, {
        requestParameters: {
          "method.request.querystring.name": true,
        },
        authorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
        methodResponses: [
          { statusCode: "200", responseParameters: commonResponseParameters },
          { statusCode: "401", responseParameters: commonResponseParameters },
          { statusCode: "403", responseParameters: commonResponseParameters },
        ],
      });

    const responseHeaders = {
      "Access-Control-Allow-Origin": "'*'",
      "Access-Control-Allow-Headers":
        "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
      "Access-Control-Allow-Methods": "'OPTIONS,GET,PUT'",
    };

    api.addGatewayResponse("GatewayResponseUnauthorized", {
      type: apigateway.ResponseType.UNAUTHORIZED,
      responseHeaders,
      statusCode: "401",
    });

    api.addGatewayResponse("GatewayResponseAccessDenied", {
      type: apigateway.ResponseType.ACCESS_DENIED,
      responseHeaders,
      statusCode: "403",
    });

    new cdk.CfnOutput(this, 'HTTP API URL', {
      value: api.url ?? 'Something went wrong with the deploy'
    });




















   /*  const api = new apigateway.HttpApi(this, 'HttpApi');

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
    }); */
  }
}
