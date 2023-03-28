"use strict";
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
dayjs.extend(timezone);

const createAdmin = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const putParams = {
    TableName: process.env.DYNAMODB_ADMIN_TABLE,
    Item: {
      uuid: uuidv4(),
      name: body.name,
      email: body.email,
    },
  };
  await dynamoDb.put(putParams).promise();
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      status: "OK",
    }),
  };

};
const deleteAdmin = async (event) => {};
const updateAdmin = async (event) => {};
const getAdmins = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const scanParams = {
    TableName: process.env.DYNAMODB_ADMIN_TABLE,
  };
  const result = await dynamoDb.scan(scanParams).promise();
  if (!result.Count) {
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      total: result.Count,
      items: result.Items.map((admin) => {
        return {
          name: admin.name,
          email: admin.email,
        };
      }),
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
};

module.exports = {
  createAdmin,
  deleteAdmin,
  updateAdmin,
  getAdmins,
};
