import * as AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  for (const record of event.Records) {
    const body = JSON.parse(record.body);

    // Assume the body contains product data
    const product = {
      id: body.id,
      name: body.name,
      price: body.price,
      // add other product properties here
    };

    const params = {
      TableName: process.env.PRODUCTS_TABLE,
      Item: product
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`Product ${product.id} created successfully`);
    } catch (error) {
      console.error(`Error creating product ${product.id}:`, error);
    }
  }
};
