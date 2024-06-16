import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import {  data, responseHandler } from "./utils/utils";


exports.handler = async (
  event: APIGatewayProxyEvent,
) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return  responseHandler(400, { message: "Product ID is required" });
  }

  const product = data.find((product) => product.id === id);

  if (!product) {
    return responseHandler(404, { message: "Product not found" });
  }

  return  responseHandler(200, product);
};