import { APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { responseHandler } from './utils';
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const PRODUCTS_TABLE_NAME: string = process.env.PRODUCTS_TABLE_NAME!;
const STOCKS_TABLE_NAME: string = process.env.STOCKS_TABLE_NAME!;
export const handler = async (): Promise<APIGatewayProxyResult> => {



  const productsParams = {
    TableName: PRODUCTS_TABLE_NAME
  };

  const stocksParams = {
    TableName: STOCKS_TABLE_NAME
  };

  try {
    const productsData = await dynamoDB.scan(productsParams).promise();
    const stocksData = await dynamoDB.scan(stocksParams).promise();
    const productsItems = productsData.Items || [];
    const stocksItems = stocksData.Items || [];
    if(!productsItems.length){
      throw new Error("No products found");
    }
    const productsList = productsItems.map(
      (product: AWS.DynamoDB.DocumentClient.AttributeMap) => {
        const stock = stocksItems.find(
          (item: AWS.DynamoDB.DocumentClient.AttributeMap) =>
            item.product_id === product.id
        );
        return {
          ...product,
          count: stock ? stock.count : 0,
        };
      }
    );

    return responseHandler(200,productsList)
  } catch (error) {
    return responseHandler(500,error)
  } 





/*   try {
    const params = { TableName: PRODUCTS_TABLE_NAME };
    const result = await dynamoDb.scan(params).promise();
    const products = result.Items || [];

    if (!products.length) {
      throw new NotFoundError("No products found");
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(products),
    };
  } catch (error: any) {
    return handleAPIGatewayError(error);
  }
 */




















};
