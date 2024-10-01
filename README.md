# AWS CDK - Customer Registration Service

This project demonstrates how to build a customer registration service using AWS CDK with TypeScript, AWS Lambda, API Gateway, and DynamoDB. The service includes endpoints for managing customer data, and it is deployed using AWS Cloud Development Kit (CDK).

## Initial Setup

Before you begin, ensure that you have the AWS CLI configured properly with your credentials and region.

1. Open a terminal and run the following command to configure your AWS CLI:

```bash
aws configure
```

2. Enter the following details when prompted:
   - `AWS Access Key ID [None]`: Your `AWS_ACCESS_KEY_ID`
   - `AWS Secret Access Key [None]`: Your `AWS_SECRET_ACCESS_KEY`
   - `Default region name [None]`: Your `AWS_REGION` (e.g., `us-west-2`)
   - `Default output format [None]`: `json`

This will set up your AWS environment for deploying resources.

---

## Project Setup

1. Create an empty directory for your project and navigate into it:

```bash
mkdir cdk && cd cdk
```

2. Initialize a new AWS CDK project using TypeScript:

```bash
cdk init sample-app --language typescript
```

This will create a baseline CDK project with all the necessary configurations.

---

## Project Structure

Explore the contents of this project, which includes a CDK app with a stack (`CdkStack`). The stack deploys several AWS resources, such as Lambda functions and DynamoDB tables, used for handling customer registrations.

The key project files include:

- **`bin/cdk.ts`**: Entry point for your CDK app.
- **`lib/cdk-stack.ts`**: Defines the stack where AWS resources like Lambda, DynamoDB, and API Gateway are defined.
- **`lambda/`**: Directory where your Lambda handler code is stored.
- **`cdk.json`**: CDK configuration file that specifies how to run the app.

---

## Useful Commands

- `npm run build` – Compile TypeScript to JavaScript.
- `npm run watch` – Watch for file changes and automatically compile.
- `npm run test` – Run Jest unit tests.
- `cdk deploy` – Deploy the stack to your default AWS account and region.
- `cdk diff` – Compare the deployed stack with the current state.
- `cdk synth` – Synthesize the CloudFormation template from your CDK app.

---

## Synthesizing a Template

To generate the CloudFormation template from your CDK app, use:

```bash
cdk synth
```

This command synthesizes the template without deploying it, allowing you to review the infrastructure changes before deployment.

---

## Bootstrapping the Environment

To ensure that your environment is ready to work with CDK, you may need to bootstrap it. Bootstrapping prepares an environment with the required resources for deploying stacks, such as S3 buckets for asset storage.

Run the following command to bootstrap the environment:

```bash
cdk bootstrap
```

---

## Deploying the Stack

Deploy your CDK stack with:

```bash
cdk deploy
```

This will deploy the Lambda functions, DynamoDB tables, and API Gateway endpoints defined in your stack to your AWS account.

### CloudFormation Console

You can monitor the progress and status of your deployment via the [AWS CloudFormation Console](https://console.aws.amazon.com/cloudformation/home).

---

## Checking Differences Before Deployment

To see what changes will be applied during the next deployment, run:

```bash
cdk diff
```

This is a best practice to avoid unexpected changes during deployment.

---

## Adding AWS Lambda Handler Code

To add custom Lambda functions for customer registration:

1. Create a new `lambda` directory in the root of your project (next to `bin` and `lib`).

```bash
mkdir lambda
```

2. Add a `.js` or `.ts` file in the `lambda` directory. For example, `customer.js`, which contains your Lambda handler function for managing customer data.

3. Ensure that the `.js` files are tracked by git by adding the following line to your `.gitignore` file:

```bash
!lambda/*.js
```

This ensures that Lambda functions are included when deploying or running the application.

---

## Testing Your Lambda Function

Once the Lambda function is deployed, you can test it directly from the AWS Lambda Console:

1. Open the [AWS Lambda Console](https://console.aws.amazon.com/lambda/home).
2. Find your function by its name and open the details page.
3. Click the **Test** tab under the **Function Overview** section.
4. In the test dialog, choose the **Amazon API Gateway AWS Proxy** template.
5. Name the event `test` and save it.
6. Run the test to trigger your Lambda function and inspect the output.

---

## Viewing DynamoDB Data

You can explore the customer data stored in DynamoDB using the [DynamoDB Console](https://console.aws.amazon.com/dynamodb/home). Your table will be available based on the configuration in your stack.

---

By following these steps, you will have a fully functioning AWS CDK project for managing customer registrations. Make sure to regularly review your infrastructure and follow best practices for testing and deployment.

### Improvements Made:

- Added an introductory section to describe the project and its purpose.
- Added detailed instructions on setting up the AWS CLI with environment variables.
- Organized the project structure section and clarified the roles of different files.
- Improved the explanation for Lambda function creation, deployment, and testing.
- Added links to AWS services (Lambda, DynamoDB) for easy navigation.
