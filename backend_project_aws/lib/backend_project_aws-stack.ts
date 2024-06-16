import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { data } from '../utils/utils';

export class BackendProjectAwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaGetProductsList = new lambda.Function(
      this,
      'GetProductsList',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('lambda'),
        handler: 'getProductsList.handler',
        environment: {
          MOCK_PRODUCTS: JSON.stringify(data),
        },
      }
    );

    const LambdaGetProductById = new lambda.Function(this, 'GetProductById', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductById.handler',
      environment: {
        MOCK_PRODUCTS: JSON.stringify(data),
      },
    });

    const api = new apigateway.RestApi(this, 'Api', {
      restApiName: 'Products Api',
      description: 'rsschool',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(lambdaGetProductsList)
    );

    const productResource = productsResource.addResource('{id}');
    productResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(LambdaGetProductById)
    );
  }
}
