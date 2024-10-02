import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

export class CustomerHandler extends Construct {
  public readonly createCustomerLambda: Function;
  public readonly readCustomerLambda: Function;
  public readonly updateCustomerLambda: Function;
  public readonly deleteCustomerLambda: Function;
  public readonly table: Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create DynamoDB table
    this.table = new Table(this, "CustomersTable", {
      partitionKey: { name: "customerId", type: AttributeType.STRING },
    });

    // Create Lambda functions
    this.createCustomerLambda = this.createLambda(
      "CreateCustomerLambda",
      "index.createCustomerHandler"
    );
    this.readCustomerLambda = this.createLambda(
      "ReadCustomerLambda",
      "index.readCustomerHandler"
    );
    this.updateCustomerLambda = this.createLambda(
      "UpdateCustomerLambda",
      "index.updateCustomerHandler"
    );
    this.deleteCustomerLambda = this.createLambda(
      "DeleteCustomerLambda",
      "index.deleteCustomerHandler"
    );

    // Grant specific DynamoDB permissions to each Lambda function
    this.grantPermissions();
  }

  // Helper function to create Lambda
  private createLambda(id: string, handler: string): Function {
    return new Function(this, id, {
      runtime: Runtime.NODEJS_20_X,
      handler,
      code: Code.fromAsset("lambda"),
      environment: {
        CUSTOMERS_TABLE_NAME: this.table.tableName,
      },
    });
  }

  // Grant specific permissions to each Lambda function
  private grantPermissions(): void {
    // Create Customer Lambda permissions (dynamodb:PutItem)
    this.createCustomerLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["dynamodb:PutItem"],
        resources: [this.table.tableArn],
      })
    );

    // Read Customer Lambda permissions (dynamodb:GetItem)
    this.readCustomerLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["dynamodb:GetItem"],
        resources: [this.table.tableArn],
      })
    );

    // Update Customer Lambda permissions (dynamodb:UpdateItem)
    this.updateCustomerLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["dynamodb:UpdateItem"],
        resources: [this.table.tableArn],
      })
    );

    // Delete Customer Lambda permissions (dynamodb:DeleteItem)
    this.deleteCustomerLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["dynamodb:DeleteItem"],
        resources: [this.table.tableArn],
      })
    );
  }
}
