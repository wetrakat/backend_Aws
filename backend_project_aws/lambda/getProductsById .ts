import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import {  data, responseHandler } from "./utils/utils";


exports.handler = async (
  event: APIGatewayProxyEvent,
) => {
  const products = JSON.parse(process.env.MOCK_PRODUCTS ?? "[]");
  const id = event.pathParameters?.id;

  if (!id) {
    return  responseHandler(400, { message: "Product ID is required" });
  }

  const product = products.find((product:any) => product.id === id);

  if (!product) {
    return responseHandler(404, { message: "Product not found" });
  }

  return  responseHandler(200, product);
};