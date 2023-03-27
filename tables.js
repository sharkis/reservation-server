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
  const putRequests = body.map((t) => ({
    PutRequest: {
      Item: {
        uuid: t.id,
        x: t.x,
        y: t.y,
        name: t.name,
        capacity: t.capacity,
      },
    },
  }));
  const batchParams = {
    RequestItems: {
      [process.env.DYNAMODB_LAYOUT_TABLE]: putRequests,
    },
  };
  await dynamoDb.batchWrite(batchParams).promise();
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
      items: result.Items.map((t) => ({
        x: t.x,
        y: t.y,
        id: t.uuid,
        name: t.name,
        capacity: t.capacity,
      })),
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
