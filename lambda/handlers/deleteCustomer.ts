import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DeleteItemCommandInput, DynamoDB } from "@aws-sdk/client-dynamodb";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const dynamo = new DynamoDB();
  const customerId = event.pathParameters?.customerId;

  if (!customerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "CustomerId is required" }),
    };
  }

  const params: DeleteItemCommandInput = {
    TableName: process.env.CUSTOMERS_TABLE_NAME!,
    Key: {
      customerId: { S: customerId },
    },
  };

  try {
    await dynamo.deleteItem(params);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Customer deleted successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error deleting customer", error }),
    };
  }
};
