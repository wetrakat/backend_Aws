import { SQSClient, GetQueueUrlCommand } from "@aws-sdk/client-sqs"; // ES Modules import
// const { SQSClient, GetQueueUrlCommand } = require("@aws-sdk/client-sqs"); // CommonJS import
const client = new SQSClient({ region: 'eu-west-1' });
const input = { // GetQueueUrlRequest
  QueueName: "ProjectAwsStack-productQueue20235078-9AxdjJK0gDBF", // required
  QueueOwnerAWSAccountId: "134877641274",
};

const command = new GetQueueUrlCommand(input);
const response = client.send(command);
console.log(response);
