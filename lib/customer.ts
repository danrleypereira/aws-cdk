import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface CustomerHandlerProps {
  /** A função Lambda que lida com a lógica de cliente **/
  downstream: IFunction;
}

export class CustomerHandler extends Construct {
  /** A função Lambda que vai lidar com cadastro de clientes */
  public readonly handler: Function;

  /** Tabela DynamoDB para armazenar os dados dos clientes */
  public readonly table: Table;

  constructor(scope: Construct, id: string, props: CustomerHandlerProps) {
    super(scope, id);

    this.table = new Table(this, "CustomersTable", {
      partitionKey: { name: "customerId", type: AttributeType.STRING },
    });

    this.handler = new Function(this, "CustomerHandler", {
      runtime: Runtime.NODEJS_18_X,
      handler: "customer.handler",
      code: Code.fromAsset("lambda"),
      environment: {
        CUSTOMERS_TABLE_NAME: this.table.tableName,
      },
    });

    // Permitir que a Lambda tenha permissões para ler e gravar dados no DynamoDB
    this.table.grantReadWriteData(this.handler);

    // Você pode adicionar mais permissões ou lógica dependendo do que precisar
    props.downstream.grantInvoke(this.handler);
  }
}
