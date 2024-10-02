import { handler } from "../../lambda/handlers/deleteCustomer";
import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { APIGatewayProxyEvent } from "aws-lambda";

// Mock the DynamoDBClient
const dynamoMock = mockClient(DynamoDBClient);

describe("deleteCustomer Lambda Function", () => {
  beforeEach(() => {
    // Reset the mock between tests
    dynamoMock.reset();
  });

  it("should successfully delete a customer", async () => {
    // Mock a successful DynamoDB response
    dynamoMock.on(DeleteItemCommand).resolves({});

    const event: APIGatewayProxyEvent = {
      httpMethod: "DELETE",
      pathParameters: {
        customerId: "123",
      },
      // Other required fields...
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toContain("Customer deleted successfully");
  });

  it("should return a 400 error if customerId is missing", async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: "DELETE",
      pathParameters: {},
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('{"message":"CustomerId is required"}');
  });
});
