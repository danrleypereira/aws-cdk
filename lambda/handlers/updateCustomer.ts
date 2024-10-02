import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";

interface ContactInfo {
  email: string;
  phone: string;
}

interface Customer {
  customerId: string;
  name?: string;
  email?: string;
  active?: boolean;
  birthdate?: string;
  addressList?: string[];
  contactInfoList?: ContactInfo[];
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const dynamo = new DynamoDB();
  const customerId = event.pathParameters?.customerId;

  if (!customerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "CustomerId is required in the path" }),
    };
  }

  let body: Customer;
  try {
    body = JSON.parse(event.body || "{}") as Customer;
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid request body", error }),
    };
  }

  // Prepare the update expression and attribute values
  const updateExpressions: string[] = [];
  const expressionAttributeValues: { [key: string]: any } = {};

  if (body.name) {
    updateExpressions.push("name = :name");
    expressionAttributeValues[":name"] = { S: body.name };
  }
  if (body.email) {
    updateExpressions.push("email = :email");
    expressionAttributeValues[":email"] = { S: body.email };
  }
  if (typeof body.active !== "undefined") {
    updateExpressions.push("active = :active");
    expressionAttributeValues[":active"] = { BOOL: body.active };
  }
  if (body.birthdate) {
    updateExpressions.push("birthdate = :birthdate");
    expressionAttributeValues[":birthdate"] = { S: body.birthdate };
  }
  if (body.addressList) {
    updateExpressions.push("addressList = :addressList");
    expressionAttributeValues[":addressList"] = {
      L: body.addressList.map((addr) => ({ S: addr })),
    };
  }
  if (body.contactInfoList) {
    updateExpressions.push("contactInfoList = :contactInfoList");
    expressionAttributeValues[":contactInfoList"] = {
      L: body.contactInfoList.map((contact) => ({
        M: {
          email: { S: contact.email },
          phone: { S: contact.phone },
        },
      })),
    };
  }

  if (updateExpressions.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "No update fields provided" }),
    };
  }

  const params: UpdateItemCommandInput = {
    TableName: process.env.CUSTOMERS_TABLE_NAME!,
    Key: {
      customerId: { S: customerId },
    },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW", // Return the updated item
  };

  try {
    const result = await dynamo.updateItem(params);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Customer updated successfully",
        updatedCustomer: result.Attributes,
      }),
    };
  } catch (error) {
    console.error("Error updating customer:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error updating customer", error }),
    };
  }
};
