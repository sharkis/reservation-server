"use strict";
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "*",
};

const createTable = async (event) => {
  const body = JSON.parse(event.body);
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const putParams = {
    TableName: process.env.DYNAMODB_LAYOUT_TABLE,
    Item: {
      x: 0,
      y: 0,
      rotation: 0,
      capacity: 0,
    },
  };
  await dynamoDb.put(putParams).promise();
  return {
    ...corsHeaders,
    statusCode: 200,
    body: JSON.stringify({}),
  };
};

const getTables = async () => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const scanParams = {
    TableName: process.env.DYNAMODB_LAYOUT_TABLE,
  };
  const result = await dynamoDb.scan(scanParams).promise();
  return {
    ...corsHeaders,
    statusCode: 200,
    body: JSON.stringify({
      total: result.Count,
      items: result.Items,
    }),
  };
};

const deleteTable = async (event) => {
  const body = JSON.parse(event.body);
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const scanParams = {
    TableName: process.env.DYNAMODB_LAYOUT_TABLE,
  };
  const result = await dynamoDb.scan(scanParams).promise();
  return {
    ...corsHeaders,
    statusCode: 200,
  };
};

const updateTable = async (event) => {
  const body = JSON.parse(event.body);
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const scanParams = {
    TableName: process.env.DYNAMODB_LAYOUT_TABLE,
  };
  const result = await dynamoDb.scan(scanParams).promise();
  return {
    ...corsHeaders,
    statusCode: 200,
    body: JSON.stringify({
      total: result.Count,
      items: result.Items,
    }),
  };
};

module.exports = {
  createTable,
  getTables,
  deleteTable,
  updateTable,
};
