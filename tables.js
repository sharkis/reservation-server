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
        areaId: t.areaId,
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

const getTables = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const areaId = event.queryStringParameters.areaId;
  const scanParams = {
    TableName: process.env.DYNAMODB_LAYOUT_TABLE,
  };
  const result = await dynamoDb.scan(scanParams).promise();
  return {
    ...corsHeaders,
    statusCode: 200,
    body: JSON.stringify({
      total: result.Count,
      items: result.Items.filter((t)=>{
        if(!!areaId){
          return t.areaId==areaId
        }
        return true;
      }).map((t) => { 
        return {
        x: t.x,
        y: t.y,
        id: t.uuid,
        name: t.name,
        capacity: t.capacity,
        rotation: t.rotation,
        areaId: t.areaId,
      }}),
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
