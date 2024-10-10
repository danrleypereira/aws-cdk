import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { Customer } from "../../models/";

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

  // Prepare update expressions and attribute values
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
          isPrimary: { BOOL: contact.isPrimary },
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
    ReturnValues: "ALL_NEW", // Ensure that updated attributes are returned
  };

  try {
    const result = await dynamo.updateItem(params);

    // Check if Attributes were returned
    const updatedCustomer = result.Attributes || {}; // Fallback to an empty object if undefined

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Customer updated successfully",
        updatedCustomer,
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
