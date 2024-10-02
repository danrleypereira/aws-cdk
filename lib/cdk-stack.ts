import { Stack, StackProps } from "aws-cdk-lib";
import {
  LambdaRestApi,
  LambdaRestApiProps,
  LambdaIntegration,
  MethodOptions,
  JsonSchemaType,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { CustomerHandler } from "./customer";
import { TableViewer } from "cdk-dynamo-table-viewer";
import { Table } from "aws-cdk-lib/aws-dynamodb";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create customer handler (manages DynamoDB and Lambdas)
    const customerHandler = new CustomerHandler(this, "CustomerHandler");

    const lambdaRestApiProps: LambdaRestApiProps = {
      restApiName: "Customer Service",
      description: "This service handles customer operations.",
      proxy: false, // Enable resource-level routing
      handler: customerHandler.createCustomerLambda,
    };
    // API Gateway to expose Lambda functions as RESTful endpoints (Set proxy to false)
    const api = new LambdaRestApi(this, "CustomerApi", lambdaRestApiProps);

    // Define request and response schemas
    const requestModel = api.addModel("CustomerRequestModel", {
      contentType: "application/json",
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          name: { type: JsonSchemaType.STRING },
          email: { type: JsonSchemaType.STRING },
          active: { type: JsonSchemaType.BOOLEAN },
          birthdate: { type: JsonSchemaType.STRING },
          addressList: {
            type: JsonSchemaType.ARRAY,
            items: { type: JsonSchemaType.STRING },
          },
          contactInfoList: {
            type: JsonSchemaType.ARRAY,
            items: {
              type: JsonSchemaType.OBJECT,
              properties: {
                email: { type: JsonSchemaType.STRING },
                phone: { type: JsonSchemaType.STRING },
              },
            },
          },
        },
        required: ["name", "email"],
      },
    });

    const responseModel = api.addModel("CustomerResponseModel", {
      contentType: "application/json",
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          message: { type: JsonSchemaType.STRING },
          customerId: { type: JsonSchemaType.STRING },
          updatedCustomer: { type: JsonSchemaType.OBJECT },
        },
      },
    });

    const methodOptions: MethodOptions = {
      requestModels: {
        "application/json": requestModel,
      },
      methodResponses: [
        {
          statusCode: "200",
          responseModels: {
            "application/json": responseModel,
          },
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    };

    // Define Lambda integrations and apply request/response validation
    const createCustomerIntegration = new LambdaIntegration(
      customerHandler.createCustomerLambda
    );
    const readCustomerIntegration = new LambdaIntegration(
      customerHandler.readCustomerLambda
    );
    const updateCustomerIntegration = new LambdaIntegration(
      customerHandler.updateCustomerLambda
    );
    const deleteCustomerIntegration = new LambdaIntegration(
      customerHandler.deleteCustomerLambda
    );

    // Create customer resource and apply CRUD methods
    const customerResource = api.root.addResource("customer");
    customerResource.addMethod(
      "POST",
      createCustomerIntegration,
      methodOptions
    );
    customerResource.addMethod("GET", readCustomerIntegration);

    const customerIdResource = customerResource.addResource("{customerId}");
    customerIdResource.addMethod(
      "PUT",
      updateCustomerIntegration,
      methodOptions
    );
    customerIdResource.addMethod("DELETE", deleteCustomerIntegration);

    // Register DynamoDB table with TableViewer
    new TableViewer(this, "ViewCustomerTable", {
      title: "Customer Registrations",
      table: customerHandler.table as Table,
    });
  }
}
