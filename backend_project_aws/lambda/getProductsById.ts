import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
  } from "aws-lambda";
import { IProduct, responseHandler } from "./utils";
  
  export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> => {
    const products: IProduct[] = JSON.parse(process.env.MOCK_PRODUCTS ?? "[]");
    const id = event.pathParameters?.id;
  
    if (!id) {
      return responseHandler(400, { message: "Product id required" });
    }
  
    const product:any = products.find((product) => product.id === id);
  
    if (!product) {
      return responseHandler(404, { message: "Product not found" });
    }
  
    return  responseHandler(200, product);
  };
  