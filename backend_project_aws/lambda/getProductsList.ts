
  import { responseHandler } from "./utils";
  import AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const productsTableName = 'products';
const stocksTableName = 'stocks';

  exports.handler = async (
  )=> {
    const productsParams = {
      TableName: productsTableName,
    };
  
    const stocksParams = {
      TableName: stocksTableName,
    };
  
    try {
      const productsData: any = await dynamoDB.scan(productsParams).promise();
      const stocksData: any = await dynamoDB.scan(stocksParams).promise();
      const productsList = productsData.Items.map((product: { id: any }) => {
        const stock = stocksData.Items.find(
          (item: { product_id: any }) => item.product_id === product.id
        );
        return {
          ...product,
          count: stock ? stock.count : 0,
        };
      });
  
      return responseHandler(200, productsList);;
    } catch (error) {
      return responseHandler(500, {
        message: error instanceof Error ? error.message : "error",
      });
    }


  };