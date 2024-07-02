import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class ProjectAwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productTable = dynamodb.Table.fromTableName(this, 'TableProd', 'products');
    const stocksTable = dynamodb.Table.fromTableName(this, 'TableStocks', 'stocks');


  
    const createProductFunction = new lambda.Function(this, 'createProductHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'createProduct.handler',
      environment: {
        PRODUCTS_TABLE_NAME: productTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
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

    const lambdaGetProductsList = new lambda.Function(this, 'GetProductsList', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductsList.handler',
      environment: {
        PRODUCTS_TABLE_NAME: 'products',
        STOCKS_TABLE_NAME: 'stocks',
      },
    });

    productTable.grantWriteData(createProductFunction);
    stocksTable.grantWriteData(createProductFunction);
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

    const api = new apigateway.HttpApi(this, 'Api', {
      description: 'products rsschool',
      corsPreflight: {
        allowOrigins: ['*'],
        allowHeaders: ['*'],
        allowMethods: [apigateway.CorsHttpMethod.ANY]
        
      },
    });

    lambdaGetProductsList.addToRolePolicy(policyStatement);
    createProductFunction.addToRolePolicy(policyStatement);
    LambdaGetProductById.addToRolePolicy(policyStatement);
    


    api.addRoutes({
      path: '/products',
      methods: [apigateway.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('getListProducts', lambdaGetProductsList),
    });

    api.addRoutes({
      path: '/products/{id}',
      methods: [apigateway.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('GetByIdProducts', LambdaGetProductById),
    });

    api.addRoutes({
      path: '/products',
      methods: [apigateway.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('createProduct', createProductFunction),
    });

    new apigateway.HttpStage(this, 'prod', {
      httpApi: api,
      stageName: 'prod',
      autoDeploy: true,
    });
  }
}
