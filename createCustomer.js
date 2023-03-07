"use strict";
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

module.exports.createCustomer = async (event) => {
  const body = JSON.parse(Buffer.from(event.body, "base64").toString());
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const putParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Item: {
      primary_key: uuidv4(),
      name: body.name,
      email: body.email,
      phone: body.phone,
    },
  };
  await dynamoDb.put(putParams).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({ primary_key: putParams.primary_key }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  };
};
