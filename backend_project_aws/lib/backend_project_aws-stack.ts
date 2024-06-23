import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class ProjectAwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productTabele = dynamodb.Table.fromTableName(this, 'ProductsTable', 'products');
    const stocksTable = dynamodb.Table.fromTableName(this, 'StocksTable', 'stocks');


    const lambdaGetProductsList = new lambda.Function(this, 'GetProductsList', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductsList.handler',
      environment: {
        PRODUCTS_TABLE_NAME: 'products',
        STOCKS_TABLE_NAME: 'stocks',
      },
    });

    const LambdaGetProductById = new lambda.Function(this, 'GetProductById', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductsById.handler',
      environment: {
        PRODUCTS_TABLE_NAME: 'products',
        STOCKS_TABLE_NAME: 'stocks',
      },
    });

    const createProductLambda = new lambda.Function(
      this,
      'CreateProductLambda',
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        code: lambda.Code.fromAsset('lambda'),
        handler: 'createProduct.handler',
        environment: {
          PRODUCTS_TABLE_NAME: 'products',
          STOCKS_TABLE_NAME: 'stocks',
        },
      }
    );

    productTabele.grantWriteData(createProductLambda);
    stocksTable.grantWriteData(createProductLambda);
    const policyStatement = new iam.PolicyStatement({
      actions: [
        'dynamodb:PutItem',
        'dynamodb:GetItem',
        'dynamodb:Scan',
        'dynamodb:Query',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
      ],
      resources: [
        'arn:aws:dynamodb:eu-west-1:134877641274:table/products',
        'arn:aws:dynamodb:eu-west-1:134877641274:table/stocks',
      ],
    });

    const api = new apigateway.RestApi(this, 'Api', {
      restApiName: 'Products Api',
      description: 'rsschool',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });
    createProductLambda.addToRolePolicy(policyStatement);
    lambdaGetProductsList.addToRolePolicy(policyStatement);
    LambdaGetProductById.addToRolePolicy(policyStatement);
    

    const productsResource = api.root.addResource('products');

    productsResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(lambdaGetProductsList)
    );

    const productResourceById = productsResource.addResource('{id}');
    productResourceById.addMethod(
      'GET',
      new apigateway.LambdaIntegration(LambdaGetProductById)
    );
    productsResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(createProductLambda)
    );
  }
}
