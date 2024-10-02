import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

interface ContactInfo {
  email: string;
  phone: string;
}

interface Customer {
  customerId: string;
  name: string;
  email: string;
  active: boolean;
  birthdate: string;
  addressList: string[];
  contactInfoList: ContactInfo[];
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // Create AWS SDK client
  const dynamo = new DynamoDB();

  // Ensure the body exists and parse it
  let body: Customer;
  try {
    body = JSON.parse(event.body || "{}") as Customer;
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid request body", error }),
    };
  }

  // Build the parameters for the DynamoDB putItem request
  const params = {
    TableName: process.env.CUSTOMERS_TABLE_NAME!,
    Item: {
      customerId: { S: body.customerId },
      name: { S: body.name },
      email: { S: body.email },
      active: { BOOL: body.active },
      birthdate: { S: body.birthdate },
      addressList: { L: body.addressList.map((address) => ({ S: address })) },
      contactInfoList: {
        L: body.contactInfoList.map((contactInfo) => ({
          M: {
            email: { S: contactInfo.email },
            phone: { S: contactInfo.phone },
          },
        })),
      },
    },
  };

  try {
    await dynamo.putItem(params);
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Cliente criado com sucesso!" }),
    };
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erro ao criar cliente", error }),
    };
  }
};
