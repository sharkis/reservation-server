"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const getVips = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const scanParams = {
    TableName: process.env.DYNAMODB_VIP_TABLE,
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
      items: result.Items.map((vip) => {
        return {
          uuid: vip.uuid,
          name: vip.name,
          phone: vip.phone,
          email: vip.email,
          notes: vip.notes,
          relationship: vip.relationship,
          seating: vip.seating,
          food: vip.food,
          drink: vip.drink,
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
    statusCode: 200,
    body: JSON.stringify({
      name: result.name,
    }),
  };
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
      notes: body.notes,
      food: body.food,
      drink: body.drink,
      relationship: body.relationship,
      seating: body.seating,
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

const updateVip = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const updateParams = {
    TableName: process.env.DYNAMODB_VIP_TABLE,
    Key: {
      uuid: body.uuid
    },
    UpdateExpression:
      "set #n=:n, #p=:p, #e=:e, #no=:no, #f=:f, #d=:d, #s=:s, #r=:r",
    ExpressionAttributeNames: {
      "#n": "name",
      "#p": "phone",
      "#e": "email",
      "#no": "notes",
      "#f": "food",
      "#d": "drink",
      "#s": "seating",
      "#r": "relationship",
    },
    ExpressionAttributeValues: {
      ":n": body.name,
      ":p": body.phone,
      ":e": body.email,
      ":no": body.notes,
      ":f": body.food,
      ":d": body.drink,
      ":s": body.seating,
      ":r": body.relationship,
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
  createVip,
  updateVip,
  deleteVip,
  getVip,
  getVips,
};
