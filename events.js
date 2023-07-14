"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const getEvents = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const scanParams = {
    TableName: process.env.DYNAMODB_EVENTS_TABLE,
  };
  const result = await dynamoDb.scan(scanParams).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({
      total: result.Count,
      items: result.Items.map((event) => {
        return {
          uuid: event.uuid,
          name: event.name,
          startdate: event.startdate,
          enddate: event.enddate,
          allday: event.allday,
        };
      }),
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
};

const createEvent = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const putParams = {
    TableName: process.env.DYNAMODB_EVENTS_TABLE,
    Item: {
      uuid: uuidv4(),
      name: body.name,
      startdate: body.startdate,
      enddate: body.enddate,
      allday: body.allday,
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

const deleteEvent = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const deleteParams = {
    TableName: process.env.DYNAMODB_EVENTS_TABLE,
    Key: {
      uuid: body.uuid,
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

const updateEvent = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const updateParams = {
    TableName: process.env.DYNAMODB_EVENTS_TABLE,
    Key: {
      uuid: body.uuid,
    },
    UpdateExpression: "set #n=:n, #s=:s, #e=:e, #a=:a",
    ExpressionAttributeNames: {
      "#n": "name",
      "#s": "startdate",
      "#e": "enddate",
      "#a": "allday",
    },
    ExpressionAttributeValues: {
      ":n": body.name,
      ":s": body.startdate,
      ":e": body.enddate,
      ":a": body.allday,
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
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
