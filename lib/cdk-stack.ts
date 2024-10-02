import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaRestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { CustomerHandler } from "./customer";
import { TableViewer } from "cdk-dynamo-table-viewer";
import { Table } from "aws-cdk-lib/aws-dynamodb";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create customer handler (manages DynamoDB and Lambdas)
    const customerHandler = new CustomerHandler(this, "CustomerHandler");

    // API Gateway to expose Lambda functions as RESTful endpoints (Set proxy to false)
    const api = new LambdaRestApi(this, "CustomerApi", {
      restApiName: "Customer Service",
      description: "This service handles customer operations.",
      handler: customerHandler.createCustomerLambda, // Default handler for POST (Create)
      proxy: false, // Disables the proxy mode to allow resource-based integration
    });

    // Create Lambda integrations for the CRUD operations
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

    // Define resources and methods for CRUD operations
    const customerResource = api.root.addResource("customer");
    customerResource.addMethod("POST", createCustomerIntegration); // Create
    customerResource.addMethod("GET", readCustomerIntegration); // Read

    const customerIdResource = customerResource.addResource("{customerId}");
    customerIdResource.addMethod("PUT", updateCustomerIntegration); // Update
    customerIdResource.addMethod("DELETE", deleteCustomerIntegration); // Delete

    // Register DynamoDB table with TableViewer
    new TableViewer(this, "ViewCustomerTable", {
      title: "Customer Registrations",
      table: customerHandler.table as Table,
    });
  }
}
