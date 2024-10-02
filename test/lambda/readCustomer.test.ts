import { handler } from "../../lambda/handlers/readCustomer";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { APIGatewayProxyEvent } from "aws-lambda";

// Mock the DynamoDBClient
const dynamoMock = mockClient(DynamoDBClient);

describe("readCustomer Lambda Function", () => {
  beforeEach(() => {
    // Reset the mock between tests
    dynamoMock.reset();
  });

  it("should successfully read a customer", async () => {
    // Mock a successful DynamoDB response
    dynamoMock.on(GetItemCommand).resolves({
      Item: {
        customerId: { S: "123" },
        name: { S: "John Doe" },
        email: { S: "john.doe@example.com" },
        active: { BOOL: true },
        birthdate: { S: "1990-01-01" },
        addressList: { L: [{ S: "123 Main St" }] },
        contactInfoList: {
          L: [
            {
              M: {
                email: { S: "contact@example.com" },
                phone: { S: "555-5555" },
              },
            },
          ],
        },
      },
    });

    const event: APIGatewayProxyEvent = {
      httpMethod: "GET",
      pathParameters: {
        customerId: "123",
      },
      // Other required fields...
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toContain("John Doe");
  });

  it("should return a 400 error if customerId is missing", async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: "GET",
      pathParameters: {},
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toContain("CustomerId is required");
  });
});
