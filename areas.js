"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const getAreas  = async (event) =>{
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const scanParams = {
    TableName: process.env.DYNAMODB_AREAS_TABLE,
  };
  return {
    statusCode:200,
    body:JSON.stringify({}),
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

module.exports = {
    getAreas,
    createArea
}