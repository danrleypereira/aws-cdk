import { handler } from "../../lambda/handlers/createCustomer";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { APIGatewayProxyEvent } from "aws-lambda";

// Mock the DynamoDBClient
const dynamoMock = mockClient(DynamoDBClient);

describe("createCustomer Lambda Function", () => {
  beforeEach(() => {
    // Reset the mock between tests
    dynamoMock.reset();
  });

  it("should successfully create a customer", async () => {
    // Mock a successful DynamoDB response
    dynamoMock.on(PutItemCommand).resolves({});

    const event: APIGatewayProxyEvent = {
      httpMethod: "POST",
      body: JSON.stringify({
        customerId: "123",
        name: "John Doe",
        email: "john.doe@example.com",
        active: true,
        birthdate: "1990-01-01",
        addressList: ["123 Main St"],
        contactInfoList: [{ email: "contact@example.com", phone: "555-5555" }],
      }),
      // Other required fields...
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(201);
    expect(result.body).toContain("Customer created successfully");
  });

  it("should return a 400 error if body is invalid", async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: "POST",
      body: "{invalid json}", // Invalid JSON
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toContain("Invalid request body");
  });
});
