import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import * as Cdk from "../lib/cdk-stack";

test("DynamoDB Table Created", () => {
  const app = new cdk.App();
  const stack = new Cdk.CdkStack(app, "MyTestStack");
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::DynamoDB::Table", {
    KeySchema: Match.arrayWith([
      Match.objectLike({
        AttributeName: "customerId",
        KeyType: "HASH",
      }),
    ]),
  });
});

test("Lambda Functions Created", () => {
  const app = new cdk.App();
  const stack = new Cdk.CdkStack(app, "MyTestStack");
  const template = Template.fromStack(stack);

  // 5 to account for the TableViewer Lambda
  template.resourceCountIs("AWS::Lambda::Function", 5);
});

test("API Gateway Created", () => {
  const app = new cdk.App();
  const stack = new Cdk.CdkStack(app, "MyTestStack");
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::ApiGateway::RestApi", {
    Name: "Customer Service",
  });
});
