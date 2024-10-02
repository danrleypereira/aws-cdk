### AWS CDK - Customer Registration Service

This project demonstrates how to build a customer registration service using AWS CDK (Cloud Development Kit) with TypeScript, AWS Lambda, API Gateway, and DynamoDB. The service includes endpoints for managing customer data, including creation, reading, updating, and deletion of customers.

## Key Commands to Set Up, Deploy, and Manage the Stack

### 1. **Bootstrap the Environment**

Before deploying the stack, you must bootstrap your AWS environment. This step ensures that CDK has the necessary resources (like S3 buckets) to deploy the stack.

```bash
cdk bootstrap
```

### 2. **Synthesize CloudFormation Template**

Generate the CloudFormation template from your CDK code without deploying it:

```bash
cdk synth
```

This allows you to review the template and ensure that the infrastructure changes are correct.

### 3. **Deploy the Stack**

Deploy the CDK stack to your AWS account and region:

```bash
cdk deploy
```

This will deploy the Lambda functions, DynamoDB tables, and API Gateway endpoints that are defined in the project.

### 4. **Check Differences Before Deployment**

To view what changes will be applied during the next deployment, run:

```bash
cdk diff
```

This helps ensure that there are no unintended infrastructure changes.

### 5. **Cleaning Up the Stack**

To remove the stack and all associated AWS resources:

```bash
cdk destroy
```

This command will tear down all AWS resources provisioned by the CDK stack.

---

## Pros and Cons of Using a Single Lambda Function vs. Granular Functions

### **One Lambda Function for All CRUD Operations**

**Pros:**

- **Simpler Management**: A single Lambda function means less management overhead, with all logic in one place.
- **Reusability**: Common logic (such as input validation, error handling) can be centralized in one function, reducing redundancy.
- **Lower Costs**: Potentially fewer AWS resources to manage and optimize.

**Cons:**

- **Increased Complexity**: As more operations (create, read, update, delete) are handled by a single function, the logic can become harder to maintain and debug.
- **Scaling Constraints**: The function must scale together for all operations, even if one operation (e.g., create) is more resource-intensive than others.
- **Broader Permissions**: The Lambda function will require broader permissions to perform all actions, increasing the risk of over-permissioning.

### **Granular Lambda Functions for Each Operation**

**Pros:**

- **Clear Separation of Concerns**: Each Lambda function has a single responsibility, making the logic easier to understand, test, and maintain.
- **Independent Scaling**: Each function can scale based on the load for that specific operation, improving cost efficiency.
- **Granular Permissions**: Each function can be granted specific permissions (e.g., read-only for `GET`, write-only for `POST`), enhancing security.

**Cons:**

- **More Management Overhead**: You have to manage multiple Lambda functions, permissions, and environment configurations.
- **Potential for Code Duplication**: Common logic (like error handling or input parsing) might need to be duplicated unless refactored into a shared utility.

---

## Next Steps

### 1. **Add Authentication and Authorization**

To secure your API endpoints, consider integrating AWS IAM or Amazon Cognito for authentication. This can restrict access to the API Gateway endpoints, ensuring that only authorized users can perform actions on the customer data.

### 2. **Enable CloudWatch Logging and Monitoring**

Set up AWS CloudWatch to monitor your Lambda functions' performance and errors. This allows you to keep track of request metrics, log data, and set up alarms for unusual activity.

- **Enable CloudWatch for API Gateway and Lambda** to monitor request logs, response times, and errors.

```bash
aws logs create-log-group --log-group-name /aws/lambda/your-lambda-name
```

### 3. **Granular IAM Permissions for Each Lambda Function**

For enhanced security, assign each Lambda function only the permissions it requires. For instance, the `readCustomer` Lambda should only need `dynamodb:GetItem` permissions, while the `createCustomer` Lambda needs `dynamodb:PutItem` permissions.

### 4. **Configure AWS X-Ray for Tracing**

Integrate AWS X-Ray with your Lambda functions and API Gateway to trace requests and debug performance bottlenecks. This can help identify slow operations in the API lifecycle.
