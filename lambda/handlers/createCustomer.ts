import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB, PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import { Customer } from "../../models/";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const dynamo = new DynamoDB();
  let body: Customer;

  try {
    body = JSON.parse(event.body || "{}") as Customer;

    // Check if contactInfoList exists and has at least one contact
    if (!body.contactInfoList || body.contactInfoList.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Contact list cannot be empty.",
        }),
      };
    }

    // Check if at least one contact is marked as primary
    const hasPrimaryContact = body.contactInfoList.some(
      (contact) => contact.isPrimary
    );
    if (!hasPrimaryContact) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            "At least one contact must be marked as primary (isPrimary: true).",
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid request body", error }),
    };
  }

  const params: PutItemCommandInput = {
    TableName: process.env.CUSTOMERS_TABLE_NAME!,
    Item: {
      customerId: { S: body.customerId },
      name: { S: body.name },
      email: { S: body.email },
      active: { BOOL: body.active },
      birthdate: { S: body.birthdate },
      addressList: { L: body.addressList.map((address) => ({ S: address })) },
      contactInfoList: {
        L: body.contactInfoList.map((info) => ({
          M: {
            email: { S: info.email },
            phone: { S: info.phone },
            isPrimary: { BOOL: info.isPrimary },
          },
        })),
      },
    },
  };

  try {
    await dynamo.putItem(params);
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Customer created successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error creating customer", error }),
    };
  }
};
