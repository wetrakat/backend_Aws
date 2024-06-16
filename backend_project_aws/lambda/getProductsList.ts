import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
  } from "aws-lambda";
  import {  responseHandler } from "../utils/utils";
  
  export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> => {
    const products = JSON.parse(process.env.MOCK_PRODUCTS ?? "[]");
    if (!products.length) {
      return responseHandler(404, { message: "No products found" });
    }
  
    return responseHandler(200, products);
  };