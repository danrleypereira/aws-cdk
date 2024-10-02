import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { IFunction } from "aws-cdk-lib/aws-lambda";

export class CustomerHandler extends Construct {
  /** DynamoDB table */
  public readonly table: ITable;

  /** Lambda functions for CRUD operations */
  public readonly createCustomerLambda: IFunction;
  public readonly readCustomerLambda: IFunction;
  public readonly updateCustomerLambda: IFunction;
  public readonly deleteCustomerLambda: IFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create the DynamoDB table
    this.table = new Table(this, "CustomersTable", {
      partitionKey: { name: "customerId", type: AttributeType.STRING },
    });

    // Create Lambda functions and grant access to the DynamoDB table
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

    // Grant permissions for all Lambdas to access the DynamoDB table
    this.table.grantReadWriteData(this.createCustomerLambda);
    this.table.grantReadWriteData(this.readCustomerLambda);
    this.table.grantReadWriteData(this.updateCustomerLambda);
    this.table.grantReadWriteData(this.deleteCustomerLambda);
  }

  /**
   * Utility function to create a Lambda function and assign the necessary properties.
   * Helps in reducing repetitive code (DRY principle).
   */
  private createLambda(id: string, handler: string): IFunction {
    return new Function(this, id, {
      runtime: Runtime.NODEJS_20_X,
      handler: handler,
      code: Code.fromAsset("lambda"),
      environment: {
        CUSTOMERS_TABLE_NAME: this.table.tableName,
      },
    });
  }
}
