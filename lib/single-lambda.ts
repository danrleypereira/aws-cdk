import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDB();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const httpMethod = event.httpMethod;
  const path = event.path;

  switch (httpMethod) {
    case "POST":
      return await createCustomer(event);
    case "GET":
      return await readCustomer(event);
    case "PUT":
      return await updateCustomer(event);
    case "DELETE":
      return await deleteCustomer(event);
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
  }
};

// Define your CRUD operations below
const createCustomer = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Handle the creation logic
  return { statusCode: 201, body: "Customer created!" };
};

const readCustomer = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Handle the read logic
  return { statusCode: 200, body: "Customer read!" };
};

const updateCustomer = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Handle the update logic
  return { statusCode: 200, body: "Customer updated!" };
};

const deleteCustomer = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Handle the delete logic
  return { statusCode: 200, body: "Customer deleted!" };
};
