import AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const productsTableName = 'products';
const stocksTableName = 'stocks';

const handler = async () => {
  
  const productsParams = {
    TableName: productsTableName,
  };

  const stocksParams = {
    TableName: stocksTableName,
  };

  try {
    const params = { TableName: productsTableName };
    const result = await dynamoDB.scan(params).promise();
    const products = result.Items || [];

    if (!products.length) {
      throw new Error("No products found");
    }

    return console.log({
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(products),
    })
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }











  /* 
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

    return console.log({
      statusCode: 200,
      body: JSON.stringify(productsList),
    })
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  } */
};

handler();
