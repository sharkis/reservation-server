"use strict";
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const createReservation = async (event) => {
  const body = JSON.parse(Buffer.from(event.body, "base64").toString());
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const date = +(body.timestamp / 86400).toFixed(0);
  const putParams = {
    TableName: process.env.DYNAMODB_RESERVATION_TABLE,
    Item: {
      day: date,
      uuid: uuidv4(),
      area: body.area,
      customer: body.customer,
      notes: body.notes,
      occasion: body.occasion,
      size: body.size,
      timestamp: body.timestamp,
    },
  };
  await dynamoDb.put(putParams).promise();
  return {
    statusCode: 200,
  };
};

const getReservations = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const scanParams = {
    TableName: process.env.DYNAMODB_RESERVATION_TABLE,
  };
  const result = await dynamoDb.scan(scanParams).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({
      total: result.Count,
      items: await result.Items.map((reservation) => {
        return {
          area: reservation.area,
          customer: reservation.customer,
          notes: reservation.notes,
          occasion: reservation.occasion,
          size: reservation.size,
          timestamp: reservation.timestamp,
          date: reservation.day
        };
      }),
    }),
  };
};

const checkReservation = async (event) => {
  const body = JSON.parse(Buffer.from(event.body, "base64").toString());
  const scanParams = {
    TableName: process.env.DYNAMODB_RESERVATION_TABLE,
    Select: COUNT,
  };
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const result = await dynamoDb.scan(scanParams).promise();
  return {
    statusCode: 200,
  };
};

module.exports = {
  checkReservation,
  createReservation,
  getReservations,
};
