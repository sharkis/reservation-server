"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const getTags = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const scanParams = {
    TableName: process.env.DYNAMODB_TAGS_TABLE,
  };
  const result = await dynamoDb.scan(scanParams).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({
      total: result.Count,
      items: result.Items.map((tag) => {
        return {
          uuid: tag.uuid,
          name: tag.name,
          color: tag.color,
        };
      }),
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
};

const createTag = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const putParams = {
    TableName: process.env.DYNAMODB_TAGS_TABLE,
    Item: {
      uuid: uuidv4(),
      name: body.name,
      color: body.color,
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

const deleteTag = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const deleteParams = {
    TableName: process.env.DYNAMODB_TAGS_TABLE,
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

const updateTag = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const updateParams = {
    TableName: process.env.DYNAMODB_TAGS_TABLE,
    Key: {
      uuid: body.uuid
    },
    UpdateExpression:
      "set #n=:n, #c=:c",
    ExpressionAttributeNames: {
      "#n": "name",
      "#c": "color",
    },
    ExpressionAttributeValues: {
      ":n": body.name,
      ":c": body.color,
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

module.exports = {
  getTags,
  createTag,
  deleteTag,
  updateTag
};
