export const data = [
    { id: '1', title: 'Home1', description: 'big home', price: 100 },
    { id: '2', title: 'Home2', description: 'average home', price: 200 },
    { id: '3', title: 'Home3', description: 'small home', price: 300 },
  ];
  type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;


  export const responseHandler = (statusCode: number, body: JSONValue): any => {
    return {
      statusCode,
      headers: {
        "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "application/json",
      },
      body: JSON.stringify(body)
    };
  };


  export interface IProduct {
    id: string;
    title: string;
    description: string;
    price: number;
  }