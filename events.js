"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const getEvents  = async (event) =>{
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const scanParams = {
    TableName: process.env.DYNAMODB_EVENTS_TABLE,
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

module.exports = {
    getEvents
}