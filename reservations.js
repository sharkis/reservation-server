"use strict";
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const createReservation = async (event) => {
  const body = JSON.parse(event.body);
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const date = +(body.timestamp / 86400).toFixed(0);
  const custParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Item: {
      primary_key: uuidv4(),
      name: body.name,
      email: body.email,
      phone: body.phone,
    },
  }
  custResult = await dynamoDb.put(custParams).promise();
  const putParams = {
    TableName: process.env.DYNAMODB_RESERVATION_TABLE,
    Item: {
      dayval: date,
      uuid: uuidv4(),
      area: body.area,
      customer: custParams.primary_key,
      notes: body.notes,
      occasion: body.occasion,
      size: body.size,
      timestamp: body.timestamp,
    },
  };
  await dynamoDb.put(putParams).promise();
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      status:"OK"
    })
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
          date: reservation.dayval,
        };
      }),
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  };
};

const checkReservation = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const sdate = +(body.timestamp / 86400).toFixed(0);
  const windowStart = body.timestamp - 150 * 60; // 150 minutes - longest reservation
  const windowEnd = body.timestamp + 150 * 60; // 150 minutes - longest reservation
  const queryParams = {
    TableName: process.env.DYNAMODB_RESERVATION_TABLE,
    ExpressionAttributeValues: {
      ":sd": sdate,
      ":st": windowStart,
      ":et": windowEnd
    },
    ExpressionAttributeNames: {
      "#ts": "timestamp"
    },
    KeyConditionExpression: "dayval = :sd",
    FilterExpression: "#ts > :st and #ts < :et",
  };
  const result = await dynamoDb.query(queryParams).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({
      total: result.Count || 0,
      available: true,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  };
};

module.exports = {
  checkReservation,
  createReservation,
  getReservations,
};
