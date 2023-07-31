"use strict";
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { phone } = require("phone");
const client = require("twilio")(process.env.twilioSID, process.env.twilioAuth);
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
dayjs.extend(timezone);

const createReservation = async (event) => {
  const origPhone = "+18884921198";
  const body = JSON.parse(event.body);
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const bucketdate = new Date(body.datetime);
  const ses = new AWS.SES();
  const putParams = {
    TableName: process.env.DYNAMODB_RESERVATION_TABLE,
    Item: {
      dayval: +(
        bucketdate.getFullYear() +
        "" +
        bucketdate.getMonth() +
        "" +
        bucketdate.getDate()
      ),
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
      restrictions: body.restrictions,
    },
  };
  const emailParams = {
    Destination: {
      ToAddresses: [body.customer.email],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: `Your Lola Rose reservation for ${body.size} people on ${dayjs
            .unix(body.datetime)
            .tz("America/Denver")
            .format("dddd, D MMM [at] h:mm a")} is CONFIRMED.`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Your Lola Rose reservation`,
      },
    },
    Source: "contact@lolaroseelpaso.com",
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
  await ses.sendEmail(emailParams).promise();

  // check if this reservation is for VIP
  const queryParams = {
    TableName: process.env.DYNAMODB_VIP_TABLE,
    ExpressionAttributeValues: {
      ":e": body.customer.email,
    },
    FilterExpression: "email = :e",
  };
  const result = await dynamoDb.scan(queryParams).promise();
  if (result.Count > 0) {
    // email admins if it is
    const adminScanParams = {
      TableName: process.env.DYNAMODB_ADMIN_TABLE,
    };
    const admins = await dynamoDb.scan(adminScanParams).promise();
    const adminEmails = admins.Items.map((a) => a.email);
    const adminEmailParams = {
      Destination: {
        ToAddresses: adminEmails,
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: `VIP Lola Rose reservation for ${body.customer.name}, ${
              body.size
            } people on ${dayjs
              .unix(body.datetime)
              .tz("America/Denver")
              .format("dddd, D MMM [at] h:mm a")} has been created.`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `VIP Lola Rose reservation`,
        },
      },
      Source: "contact@lolaroseelpaso.com",
    };
    await ses.sendEmail(adminEmailParams).promise();
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
  const bucketdate = new Date(+qdate);
  const scanParams = {
    TableName: process.env.DYNAMODB_RESERVATION_TABLE,
    FilterExpression: "dayval = :d",
    ExpressionAttributeValues: {
      ":d": +(
        bucketdate.getFullYear() +
        "" +
        bucketdate.getMonth() +
        "" +
        bucketdate.getDate()
      ),
    },
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
          restrictions: reservation.restrictions,
          tags: reservation.tags,
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
  const bucketdate = new Date(body.timestamp * 1000);
  const windowStart = body.timestamp - 150 * 60; // 150 minutes - longest reservation
  const windowEnd = body.timestamp + 150 * 60; // 150 minutes - longest reservation
  const queryParams = {
    TableName: process.env.DYNAMODB_RESERVATION_TABLE,
    ExpressionAttributeValues: {
      ":sd": +(
        bucketdate.getFullYear() +
        "" +
        bucketdate.getMonth() +
        "" +
        bucketdate.getDate()
      ),
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

const updateReservation = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const updateParams = {
    TableName: process.env.DYNAMODB_RESERVATION_TABLE,
    Key: {
      uuid: body.uuid,
    },
    UpdateExpression:
      "set #a=:a, #c=:c, #d=:d, #n=:n, #o=:o, #r=:r, #s=:s, #t=:t, #ta=:ta",
    ExpressionAttributeNames: {
      "#a": "area",
      "#c": "customer",
      "#d": "date",
      "#n": "notes",
      "#o": "ocassion",
      "#r": "restrictions",
      "#s": "size",
      "#t": "timestamp",
      "#ta": "tags",
    },
    ExpressionAttributeValues: {
      ":a": body.area,
      ":c": body.customer,
      ":d": body.date,
      ":n": body.notes,
      ":o": body.ocassion,
      ":r": body.restrictions,
      ":s": body.size,
      ":t": body.timestamp,
      ":ta": body.tags,
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
  checkReservation,
  createReservation,
  getReservations,
  deleteReservation,
  updateReservation,
};
