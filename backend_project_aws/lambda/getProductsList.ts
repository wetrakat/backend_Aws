
  import {  data, responseHandler } from "./utils";
  
  exports.handler = async (
  )=> {


    try {
      return responseHandler(200, data);;
    } catch (error) {
      return responseHandler(500, {
        message: error instanceof Error ? error.message : "error",
      });
    }


  };