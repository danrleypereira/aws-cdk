import { handler } from "../../lambda/handlers/updateCustomer";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { APIGatewayProxyEvent } from "aws-lambda";

// Mock the DynamoDBClient
const dynamoMock = mockClient(DynamoDBClient);

describe("updateCustomer Lambda Function", () => {
  beforeEach(() => {
    // Reset the mock between tests
    dynamoMock.reset();
  });

  it("should successfully update a customer", async () => {
    // Mock a successful DynamoDB response
    dynamoMock.on(UpdateItemCommand).resolves({});

    const event: APIGatewayProxyEvent = {
      httpMethod: "PUT",
      body: JSON.stringify({
        name: "John Doe",
        email: "john.doe@example.com",
        active: true,
        birthdate: "1990-01-01",
        addressList: ["123 Main St"],
        contactInfoList: [{ email: "contact@example.com", phone: "555-5555" }],
      }),
      pathParameters: {
        customerId: "123", // Include the customerId in the pathParameters
      },
      // Other required fields...
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toContain("Customer updated successfully");
  });

  it("should return a 400 error if body is invalid", async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: "PUT",
      body: "{invalid json}", // Invalid JSON
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toContain(
      '{"message":"CustomerId is required in the path"}'
    );
  });
});
