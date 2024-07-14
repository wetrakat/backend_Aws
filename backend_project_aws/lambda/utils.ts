export interface IProduct {
  id: string;
  title: string;
  description: string;
  price: number;
}
export interface IStocks {
  product_id: string;
  count: number;
}

export interface IProducts {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
}


export const responseHandler = (statusCode: number, body: any): any => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
};
