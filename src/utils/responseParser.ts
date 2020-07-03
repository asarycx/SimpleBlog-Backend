import * as _ from "underscore";

export function success(objex: {
  name: string;
  message: string;
  status?: string;
  data?: any;
}) {
  let { name, message, status, data } = objex;
  return {
    name,
    message,
    status: status || "Success.",
    data,
  };
}

export function failed(objex: {
  name: string;
  message: string;
  status?: string;
  data?: any;
}) {
  let { name, message, status, data } = objex;
  return {
    name,
    message,
    status: status || "Failed",
    data,
  };
}

export function errorValidation(objex: {
  name: string;
  message: string;
  status?: string;
  data?: any;
}) {
  let { name, message, status, data } = objex;
  let errorObject = _.map(data, (e, key) => {
    return e;
  });
  return {
    name,
    message,
    status: "Validation",
    data: errorObject,
  };
}
