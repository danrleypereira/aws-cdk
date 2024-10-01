import { Stack, StackProps } from "aws-cdk-lib";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { TableViewer } from "cdk-dynamo-table-viewer";
import { CustomerHandler } from "./customer";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const customerLambda = new Function(this, "CustomerLambda", {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset("lambda"),
      handler: "customer.handler",
    });

    const customerWithHandler = new CustomerHandler(this, "CustomerHandler", {
      downstream: customerLambda,
    });

    const gatewayCustomer = new LambdaRestApi(this, "CustomerApi", {
      handler: customerWithHandler.handler,
    });

    const customerTableViewer = new TableViewer(this, "ViewCustomerTable", {
      title: "Customer Registrations",
      table: customerWithHandler.table,
    });
  }
}
