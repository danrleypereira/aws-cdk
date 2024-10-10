import { handler } from "../../lambda/handlers/updateCustomer";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { APIGatewayProxyEvent } from "aws-lambda";
import path = require("path");

// Mock the DynamoDBClient
const dynamoMock = mockClient(DynamoDBClient);

fdescribe("updateCustomer Lambda Function", () => {
  beforeEach(() => {
    // Reset the mock between tests
    dynamoMock.reset();
  });

  it("should successfully update a customer with a primary contact", async () => {
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
        contactInfoList: [
          { email: "contact@example.com", phone: "555-5555", isPrimary: true },
        ],
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

  it("should return a 400 error if no contact is marked as primary", async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: "PUT",
      body: JSON.stringify({
        name: "John Doe",
        email: "john.doe@example.com",
        active: true,
        birthdate: "1990-01-01",
        addressList: ["123 Main St"],
        contactInfoList: [
          { email: "contact@example.com", phone: "555-5555", isPrimary: false },
        ],
      }),
      pathParameters: {
        customerId: "123", // Include the customerId in the pathParameters
      },
      // Other required fields...
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toContain(
      "At least one contact must be marked as primary"
    );
  });

  it("should return a 400 error if body is invalid", async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: "PUT",
      body: "{invalid json}", // Invalid JSON
      pathParameters: {
        customerId: "123", // Include the customerId in the pathParameters
      },
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toContain("Invalid request body");
  });

  it("should return a 400 error if customerId is missing from the path", async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: "PUT",
      body: JSON.stringify({
        name: "John Doe",
        email: "john.doe@example.com",
        active: true,
        birthdate: "1990-01-01",
        addressList: ["123 Main St"],
        contactInfoList: [
          { email: "contact@example.com", phone: "555-5555", isPrimary: true },
        ],
      }),
      pathParameters: {}, // Missing customerId
      // Other required fields...
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toContain("CustomerId is required in the path");
  });
});
