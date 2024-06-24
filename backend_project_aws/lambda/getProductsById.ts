import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
  } from "aws-lambda";
import {  responseHandler } from "./utils";
import * as AWS from "aws-sdk";
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const PRODUCTS_TABLE_NAME: string = process.env.PRODUCTS_TABLE_NAME!;
const STOCKS_TABLE_NAME: string = process.env.STOCKS_TABLE_NAME!;
  export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> => {

    console.log(event);

    const id = event.pathParameters?.id;
    if (!id) {
      return responseHandler(400, { message: "Product id required" });
    }
    const productParams = {
      TableName: PRODUCTS_TABLE_NAME,
      Key: { id },
    };
  
    const stockParams = {
      TableName: STOCKS_TABLE_NAME,
      Key: { product_id: id },
    };
  
    try {
      const productData = await dynamoDB.get(productParams).promise();
    const stockData = await dynamoDB.get(stockParams).promise();

    const product = {
      ...productData.Item,
      count: stockData.Item ? stockData.Item.count : 0,
    };

  
      return  responseHandler(200, product);
    } catch (error) {
      return responseHandler(500, {
        message: error instanceof Error ? error.message : "error",
      });
    }













/* 
    const products: IProduct[] = JSON.parse(process.env.MOCK_PRODUCTS ?? "[]");
    const id = event.pathParameters?.id;
  
    if (!id) {
      return responseHandler(400, { message: "Product id required" });
    }
  
    const product:any = products.find((product) => product.id === id);
  
    if (!product) {
      return responseHandler(404, { message: "Product not found" });
    }
  
    return  responseHandler(200, product); */
  };
  