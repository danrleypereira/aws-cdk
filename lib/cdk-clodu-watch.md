```typescript
import { Stack, StackProps } from "aws-cdk-lib";
import {
  LambdaRestApi,
  LambdaIntegration,
  MethodOptions,
  JsonSchemaType,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { CustomerHandler } from "./customer";
import { TableViewer } from "cdk-dynamo-table-viewer";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { Alarm, ComparisonOperator, Metric } from "aws-cdk-lib/aws-cloudwatch";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const customerHandler = new CustomerHandler(this, "CustomerHandler");

    const api = new LambdaRestApi(this, "CustomerApi", {
      restApiName: "Customer Service",
      description: "This service handles customer operations.",
      proxy: false, // Enable resource-level routing
    });

    // Define Lambda integrations
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
    customerResource.addMethod("POST", createCustomerIntegration);
    customerResource.addMethod("GET", readCustomerIntegration);

    const customerIdResource = customerResource.addResource("{customerId}");
    customerIdResource.addMethod("PUT", updateCustomerIntegration);
    customerIdResource.addMethod("DELETE", deleteCustomerIntegration);

    // Register DynamoDB table with TableViewer
    new TableViewer(this, "ViewCustomerTable", {
      title: "Customer Registrations",
      table: customerHandler.table as Table,
    });

    // Create CloudWatch Log Groups for each Lambda function with retention period
    new LogGroup(this, "CreateCustomerLogGroup", {
      logGroupName: `/aws/lambda/${customerHandler.createCustomerLambda.functionName}`,
      retention: RetentionDays.ONE_WEEK, // Retain logs for one week
    });

    new LogGroup(this, "ReadCustomerLogGroup", {
      logGroupName: `/aws/lambda/${customerHandler.readCustomerLambda.functionName}`,
      retention: RetentionDays.ONE_WEEK,
    });

    new LogGroup(this, "UpdateCustomerLogGroup", {
      logGroupName: `/aws/lambda/${customerHandler.updateCustomerLambda.functionName}`,
      retention: RetentionDays.ONE_WEEK,
    });

    new LogGroup(this, "DeleteCustomerLogGroup", {
      logGroupName: `/aws/lambda/${customerHandler.deleteCustomerLambda.functionName}`,
      retention: RetentionDays.ONE_WEEK,
    });

    // Create CloudWatch Alarms
    const errorAlarm = new Alarm(this, "LambdaErrorAlarm", {
      metric: new Metric({
        namespace: "AWS/Lambda",
        metricName: "Errors",
        dimensionsMap: {
          FunctionName: customerHandler.createCustomerLambda.functionName,
        },
        statistic: "sum",
        period: Duration.minutes(5),
      }),
      threshold: 1, // Trigger alarm on more than 1 error in 5 minutes
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    });

    const durationAlarm = new Alarm(this, "LambdaDurationAlarm", {
      metric: new Metric({
        namespace: "AWS/Lambda",
        metricName: "Duration",
        dimensionsMap: {
          FunctionName: customerHandler.createCustomerLambda.functionName,
        },
        statistic: "avg",
        period: Duration.minutes(5),
      }),
      threshold: 1000, // Trigger alarm if the function takes more than 1 second on average
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    });
  }
}
```
