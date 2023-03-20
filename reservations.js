"use strict";
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { phone } = require("phone");
const client = require("twilio")(process.env.twilioSID, process.env.twilioAuth);
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(timezone);

const createReservation = async (event) => {
  const origPhone = "+18884921198";
  const body = JSON.parse(event.body);
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const date = +(body.datetime / 86400).toFixed(0);
  const putParams = {
    TableName: process.env.DYNAMODB_RESERVATION_TABLE,
    Item: {
      dayval: date,
      uuid: uuidv4(),
      area: body.area,
      customer: {
        name: body.customer.name,
        email: body.customer.email,
        phone: body.customer.phone,
      },
      notes: body.notes,
      occasion: body.occasion,
      size: body.size,
      timestamp: body.datetime,
    },
  };
  const toNumber = phone(body.customer.phone);
  await dynamoDb.put(putParams).promise();
  if (toNumber.isValid) {
    await client.messages.create({
      body: `Your Lola Rose reservation for ${body.size} people on ${dayjs
        .unix(body.datetime)
        .tz("America/Denver")
        .format("dddd, D MMM [at] h:mm a")} is CONFIRMED.`,
      from: origPhone,
      to: toNumber.phoneNumber,
    });
  }
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

const getReservations = async (event) => {
  const qdate = event.queryStringParameters.datetime;
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const scanParams = {
    TableName: process.env.DYNAMODB_RESERVATION_TABLE,
    FilterExpression: "dayval = :d",
    ExpressionAttributeValues: { ":d": +(qdate / 86400).toFixed(0) },
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
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
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
      ":et": windowEnd,
    },
    ExpressionAttributeNames: {
      "#ts": "timestamp",
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
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
};

const deleteReservation = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const deleteParams = {
    TableName: process.env.DYNAMODB_RESERVATION_TABLE,
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

module.exports = {
  checkReservation,
  createReservation,
  getReservations,
  deleteReservation,
};
