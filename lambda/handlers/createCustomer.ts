import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB, PutItemCommandInput } from "@aws-sdk/client-dynamodb";

interface Customer {
  customerId: string;
  name: string;
  email: string;
  active: boolean;
  birthdate: string;
  addressList: string[];
  contactInfoList: Array<{ email: string; phone: string }>;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const dynamo = new DynamoDB();
  let body: Customer;

  try {
    body = JSON.parse(event.body || "{}") as Customer;
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
