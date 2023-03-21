"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const getVips = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const scanParams = {
    TableName: process.env.DYNAMODB_VIP_TABLE,
  };
  const result = await dynamoDb.scan(scanParams).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({
      total: result.Count,
      items: result.items.map((vip) => {
        return {
          name: vip.name,
          phone: vip.phone,
          email: vip.email,
        };
      }),
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
};

const getVip = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const queryParams = {
    TableName: process.env.DYNAMODB_VIP_TABLE,
    ExpressionAttributeValues: {
      ":sd": body.uuid,
    },
    KeyConditionExpression: "uuid = :uuid",
  };
  const result = await dynamoDb.query(queryParams).promise();
  return {
    statusCode:200,
    body: JSON.stringify({
        name: result.name
    })
  }
};

const createVip = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const putParams = {
    TableName: process.env.DYNAMODB_VIP_TABLE,
    Item: {
      uuid: uuidv4(),
      name: body.name,
      phone: body.phone,
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

const deleteVip = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const deleteParams = {
    TableName: process.env.DYNAMODB_VIP_TABLE,
    Key: {
      HashKey: body.key,
    },
  };
  await dynamoDb.delete(deleteParams).promise();
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
};

const updateVip = async (event) => {};

module.exports = {
  createVip,
  updateVip,
  deleteVip,
  getVip,
  getVips,
};
