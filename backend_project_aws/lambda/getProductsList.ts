
  import {  data, responseHandler } from "./utils/utils";
  
  exports.handler = async (
  )=> {


    try {
      return responseHandler(200, data);;
    } catch (error) {
      return responseHandler(500, {
        message: error instanceof Error ? error.message : "error",
      });
    }



   /*  const products = JSON.parse(process.env.MOCK_PRODUCTS ?? "[]");
    if (!products.length) {
      return responseHandler(404, { message: "No products found" });
    }
  
    return responseHandler(200, products); */
  };