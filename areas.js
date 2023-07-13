"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const getAreas  = async (event) =>{
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const scanParams = {
    TableName: process.env.DYNAMODB_AREAS_TABLE,
  };
  const result = await dynamoDb.scan(scanParams).promise();
  return {
    statusCode:200,
    body: JSON.stringify({
      total: result.Count,
      items: result.Items.map((area) => {
        return {
          uuid: area.uuid,
          name: area.name,
        };
      }),
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  }
}

const createArea = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const putParams = {
    TableName: process.env.DYNAMODB_AREAS_TABLE,
    Item: {
      uuid: uuidv4(),
      name: body.name,
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

const updateArea = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const updateParams = {
    TableName: process.env.DYNAMODB_AREAS_TABLE,
    Key: {
      uuid: body.uuid
    },
    UpdateExpression:
      "set #n=:n",
    ExpressionAttributeNames: {
      "#n": "name",
    },
    ExpressionAttributeValues: {
      ":n": body.name,
    },
  };
  await dynamoDb.update(updateParams).promise();
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

const deleteArea = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const deleteParams = {
    TableName: process.env.DYNAMODB_AREAS_TABLE,
    Key: {
      uuid: body.uuid
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

module.exports = {
    getAreas,
    createArea,
    updateArea,
    deleteArea
}
