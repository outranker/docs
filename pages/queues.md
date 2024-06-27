---
title: Queues
description:
image:
---

# Queues

## Introduction

When you want to build scalable applications, you need a framework which helps you scale as your product scales. This is where IntentJS Queues come in the picture. Queues are a form of asynchronous service-to-service communication used in backend architecture. You can use queues to decouple or defer compute heavy tasks such as Sending Mails, Processing large files, etc. Messages are kept in queue until processed. Separating these heavy time consuming tasks drastically improves your application's performance and also helps you keep your code clean.

IntentJS provides powerful and consistent set of APIs for interacting with frequently used message queues like `AWS SQS`, `Redis`, `RabbitMQ`, and `Kafka`.

## Configuration

By default, all of the configurations for Queues are stored inside `config/queue.ts` . You would see a similar configuration as below

```ts
import { registerAs } from "@nestjs/config";
import { SyncQueueDriver, QueueOptions } from "@intentjs/core/queue";

export default registerAs("queue", () => {
  return {
    default: "notifications",
    connections: {
      notifications: {
        driver: SyncQueueDriver,
      },
    },
  } as QueueOptions;
});
```

Let's say you want to use AWS SQS as your message queue, you can use the below mentioned configuration

```typescript
import { registerAs } from "@nestjs/config";
import { SyncQueueDriver, QueueOptions } from "@intentjs/core/queue";

export default registerAs("queue", () => {
  return {
    default: "notifications",
    connections: {
      notifications: {
        driver: SqsQueueDriver,
        apiVersion: "2012-11-05",
        profile: "default",
        prefix: "https://sqs.us-east-1.amazonaws.com/123456789012",
        queue: "MyQueue",
        suffix: "",
        region: "us-east-1",
      },
    },
  } as QueueOptions;
});
```

Now that the queue is configured,. We need to create jobs. You can think of jobs as pieces of code which will run on the other end of the queue. Technically, we dispatch jobs that will be pushed into the queue and processed by the queue worker.

Now, to create a job, this package ships a `@Job` decorator inside any `@Injectable` provider.

## Creating Job

After you are done configuring the queue, you will now need to create a job which will basically be your asynchronous piece of code.

To create a job, we will make use of `@Job` decorator from the `@injentjs/core/queue` . Note that, the job should be defined inside an Injectable only.

```typescript
import { Job } from "@intentjs/core/queue";
import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationService {
  @Job("SEND_MAIL")
  sampleMethod(data: Record<string, any>) {
    console.log("data coming ===> ", data);
    // ...add your logic here
  }
}
```

Notice the `@Job('SEND_MAIL')`. **SEND_MAIL** is the job name which we will be using when dispatching jobs.

### Options

#### connection

We understand that you may have multiple queue connections to handle in your application. While configuring the module, we set `default` connection. Incase, you want to dispatch the job on a different connection, you can do:

```typescript
@Job('SEND_MAIL', {connection: "transactional-emails"})
```

#### queue

If you want to dispatch job to a different queue but on `default` connection, you can pass the queue attribute.

```typescript
@Job('SEND_MAIL', {queue: 'payment-emails'})
```

#### tries

This package provides out-of-the-box retrial logic, so that incase if any of the job throws any error, they will be retried a specific number of times. Default being 0.

```typescript
@Job('SEND_MAIL', {tries: 3})
```

If the `SEND_MAIL` job throws any error, worker will again push the job to the queue and re-run it again. Once the maximum number of retries are exhausted, the job will be discarded as it is.

#### delay

There can be some situations where you may want to delay the job by sometime. For example, you may want to delay the job by 60 seconds, ie the job will become available to the queue worker once the delay period has been elapsed.

```typescript
@Job('SEND_MAIL', {delay: 60})
```

After creating jobs, we will now need to dispatch it. Dispatching a job basically means pushing it to the queue(sqs, redis or sync etc.) so that it can be processed by the queue worker.

## Dispatching Job

To dispatch a job, you can simply do:

### Using helper function

```typescript
import { Injectable } from "@nestjs/common";
import { Dispatch } from "@intentjs/core/queue";

@Injectable()
export class PaymentService {
  async verify(inputs: Record<string, any>): Promise<Record<string, any>> {
    // ...your custom code here
    Dispatch({
      job: "SEND_MAIL",
      data: {
        email: "abcdefgh@gmail.com",
        subject: "Yay! Your payment is succesful!",
      },
    });
  }
}
```

Notice the `Dispatch` function call, we are passing two attributes:

- **job**: Name of the job that we want to run when this payload is received by the queue worker. In our case, 'SEND_MAIL'
- **data**: Payload that we want to pass to the job. Any data that you pass here will be received by the job as its argument.

Since, the payload is serialized while pushing it to the queue, whatever type of object that you are passing will be serialized and pushed. Jobs will receive POJO/string/number as their argument.

For example, if you are passing a class instance, that will be converted into a POJO and pushed to the queue. In the job also, POJO will be received.

### Using Queue class

You can use class, to dispatch jobs in a more declarative way

```typescript
import { Injectable } from "@nestjs/common";
import { Queue } from "@intentjs/core/queue";

@Injectable()
export class PaymentService {
  async verify(inputs: Record<string, any>): Promise<Record<string, any>> {
    // ...your custom code here
    Queue.dispatch({
      job: "SEND_MAIL",
      data: {
        email: "abcdefgh@gmail.com",
        subject: "Yay! Your payment is succesful!",
      },
    });
  }
}
```

Attributes are same as above.

### Options

:::caution All the options passed while dispatching the job will override all the default options and the options defined in `@Job` :::

#### connection

We understand that you may have multiple queue connections to handle in your application. While configuring the module, we set `default` connection. Incase, you want to dispatch the job on a different connection, you can do:

```typescript
Dispatch({
  job: "SEND_MAIL",
  connection: "transactional-emails",
  data: {
    email: "abcdefgh@gmail.com",
    subject: "Yay! Your payment is succesful!",
  },
});
```

#### queue

If you want to dispatch job to a different queue but on `default` connection, you can pass the queue attribute.

```typescript
Dispatch({
  job: "SEND_MAIL",
  queue: "payment-emails",
  data: {
    email: "abcdefgh@gmail.com",
    subject: "Yay! Your payment is succesful!",
  },
});
```

#### tries

This package provides out-of-the-box retrial logic, so that incase if any of the job throws any error, they will be retried a specific number of times. Default being 0.

```typescript
Dispatch({
  job: "SEND_MAIL",
  tries: 3,
  data: {
    email: "abcdefgh@gmail.com",
    subject: "Yay! Your payment is succesful!",
  },
});
```

If the `SEND_MAIL` job throws any error, worker will again push the job to the queue and re-run it again. Once the maximum number of retries are exhausted, the job will be discarded as it is.

#### delay

There can be some situations where you may want to delay the job for a while. For example, you may want to delay the job by 60 seconds, i.e., the job will become available to the queue worker once the delay period has been elapsed.

```typescript
Dispatch({
  job: "SEND_MAIL",
  delay: 60, // in seconds
  data: {
    email: "abcdefgh@gmail.com",
    subject: "Yay! Your payment is succesful!",
  },
});
```

{% hint style="warning" %}
If you are using AWS SQS as the driver, the maximum allowed delay is 15 mins.&#x20;
{% endhint %}

## Running a Queue Worker

Now that we have seen how to create a job and dispatching it. We need to run a worker as well to listen to the incoming messages from the queue and process them.

{% hint style="info" %}
You don't need to run QueueWorker if you are using Sync driver.
{% endhint %}

IntentJS comes with a command which you can use to run the \`QueueWorker\`

```bash
node intent queue:work
```

To define the connection, simply do

```bash
node intent queue:work --connection=highpriority
```

To define the queue in the default connection

```bash
node intent queue:work --queue=high-priority-queue
```

To define the sleep time if message queue is empty, before it starts checking again

```bash
node intent queue:work --sleep=20 # in seconds
```

### Available Commands

Following commands are available which you can use with `node intent`

<table><thead><tr><th width="263">Command</th><th>Description</th></tr></thead><tbody><tr><td>queue:work</td><td>Command to run the queue worker, starts processing the jobs</td></tr><tr><td>queue:length</td><td>Command to get the length of the specified queue</td></tr><tr><td>queue:purge</td><td>Command to purge the queue</td></tr></tbody></table>

While the `queue:work` command will be good enough for majority of the cases, however if you want to write your `queue:work` script, you can make use of `QueueWorker` class, like below.

```typescript
const worker = QueueWorker.init({
  connection: "default",
  queue: "default-queue",
  sleep: 10,
});
await worker.listen(); // this will run a forever running thread to listen to the incoming messages
```

Note that if any of the value is not passed, then default setting for the missing property will be used as fallback.

{% hint style="success" %}
&#x20;If you are using multiple queues/connections in your application, then you will have to run different queue worker instances for each queue/connection.
{% endhint %}

### Functions

#### Run Worker

To start listening to the messages, you can simply do

```typescript
await worker.listen();
```

#### Purge Queue

You may want to clear(purge) the queue, you can do so by calling `purge` method.

```typescript
await worker.purge();
```

## Drivers

In this section, we will see how you can various drivers very easily in the application.

This package supports the following drivers as of now

1. [Sync Driver](queues.md#sync-driver)
2. [AWS SQS Driver](queues.md#sqs-driver)
3. [Redis Driver](queues.md#redis-driver)
4. RabbitMQ Driver
5. [Kafka Driver](queues.md#kafka-drive)
6. [Custom Driver](queues.md#custom-driver)

### Sync Driver

This is the easiest driver of all. There can be some cases where you may want to run your code synchronously for testing or debugging purposes. So, to keep it simple, this package provides out-of-the box support for running your `Jobs` synchronously.

{% hint style="info" %}
If you are using a SyncDriver, you will have to ensure that you you are dispatching and consuming jobs in the same app.
{% endhint %}

### SQS Driver

[AWS SQS](https://aws.amazon.com/sqs/) is one of the most popular choice of using managed queue service. To use the driver, you need to install it first.

```bash
npm i aws-sdk
```

Before using it, you need to configure it first like below:

```typescript
import { registerAs } from "@nestjs/config";
import { QueueOptions, SqsDriver } from "@intentjs/core/queue";

export default registerAs("queue", () => {
  return {
    default: "notifications",
    connections: {
      notifications: {
        listenerType: "poll",
        driver: SqsDriver,
        apiVersion: "2012-11-05",
        profile: "default",
        prefix: "https://sqs.us-east-1.amazonaws.com/123456789012",
        queue: "MyQueue",
        suffix: "",
        region: "us-east-1",
      },
    },
  } as QueueOptions;
});
```

`SqsQueueDriver` expects following attributes

| Attribute      | Description                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------- |
| **apiVersion** | API version to be used by SQS client                                                          |
| **profile**    | Profile of the credential that will be read by the aws-sqs sdk from `~/.aws/credentials` file |
| **region**     | Region where the queue exists                                                                 |
| **prefix**     | URL prefix of the queue                                                                       |
| **suffix**     | URL suffix of the queue                                                                       |
| **queue**      | Queue's name                                                                                  |

### Redis Driver

You can also use Redis as your queue driver. You can install it like below

```
npm i ioredis
```

Before using it, you need to configure it first like below:

```typescript
import { registerAs } from "@nestjs/config";
import { QueueOptions, RedisDriver } from "@intentjs/core/queue";

export default registerAs("queue", () => {
  return {
    default: "notifications",
    connections: {
      notifications: {
        listenerType: "poll",
        driver: RedisQueueDriver,
        queue: "MyQueue",
        host: "localhost",
        port: "6379",
        database: 0,
      },
    },
  } as QueueOptions;
});
```

`RedisQueueDriver` expects following attributes

| Attribute    | Description                   |
| ------------ | ----------------------------- |
| **host**     | Host of the redis server      |
| **port**     | Port of the redis server      |
| **database** | Database to be used for queue |
| **queue**    | Name of the queue             |

### Kafka Drive

If you want to use Kafka driver, you will first need to install

```bash
npm i kafkajs @kafkajs/confluent-schema-registry --save
```

Now you can configure it like below

```typescript
import { registerAs } from "@nestjs/config";
import { QueueOptions, KafkaDriver } from "@intentjs/core/queue";

export default registerAs("queue", () => {
  return {
    default: "kafka",
    connections: {
      kafka: {
        listenerType: "subscribe",
        driver: KafkaDriver,
        clientId: "listener-client-id",
        brokers: process.env.KAFKA_BROKERS.split(","),
        registryHost: process.env.KAFKA_SCHEMA_REGISTRY_HOST,
      },
    },
  } as QueueOptions;
});
```

### Custom Driver

If selected drivers does not meet your requirements, you can create your own custom drivers for queues like `beanstalkd`, `rabbitmq` etc.

You can easily do so using the command below:

```bash
node intent make:queue-driver MyCustomQueueDriver
```

Now, you need to create two classes `MyCustomQueueDriver` and `MyCustomQueueJob`. Here for understanding purpose we will use AWS AQS in our `MyCustom` driver.

{% code title="MyCustomDriver.ts" %}

```typescript
import { QueueDriver, InternalMessage } from "@intentjs/core";
import AWS = require("aws-sdk");
import { SqsJob } from "./job";

export class MyCustomQueueDriver implements QueueDriver {
  private client: AWS.SQS;
  private queueUrl: string;

  constructor(private options: Record<string, any>) {
    AWS.config.update({ region: options.region });
    const credential = new AWS.SharedIniFileCredentials({
      profile: options.profile,
    });
    AWS.config.credentials = credential;
    this.client = new AWS.SQS({ apiVersion: options.apiVersion });
    this.queueUrl = options.prefix + "/" + options.queue;
  }

  async push(message: string, rawPayload: InternalMessage): Promise<void> {
    const params = {
      DelaySeconds: rawPayload.delay,
      MessageBody: message,
      QueueUrl: this.options.prefix + "/" + rawPayload.queue,
    };

    await this.client.sendMessage(params).promise().then();
    return;
  }

  async pull(options: Record<string, any>): Promise<SqsJob | null> {
    const params = {
      MaxNumberOfMessages: 1,
      MessageAttributeNames: ["All"],
      QueueUrl: this.options.prefix + "/" + options.queue,
      VisibilityTimeout: 30,
      WaitTimeSeconds: 0,
    };
    const response = await this.client.receiveMessage(params).promise();
    const message = response.Messages ? response.Messages[0] : null;
    return message ? new SqsJob(message) : null;
  }

  async remove(job: SqsJob, options: Record<string, any>): Promise<void> {
    const params = {
      QueueUrl: this.options.prefix + "/" + options.queue,
      ReceiptHandle: job.data.ReceiptHandle,
    };
    await this.client.deleteMessage(params).promise();
    return;
  }

  async purge(options: Record<string, any>): Promise<void> {
    const params = {
      QueueUrl: this.options.prefix + "/" + options.queue,
    };
    await this.client.purgeQueue(params).promise();
    return;
  }

  async count(options: Record<string, any>): Promise<number> {
    const params = {
      QueueUrl: this.options.prefix + "/" + options.queue,
      AttributeNames: ["ApproximateNumberOfMessages"],
    };
    const response: Record<string, any> = await this.client
      .getQueueAttributes(params)
      .promise();
    return +response.Attributes.ApproximateNumberOfMessages;
  }
}
```

{% endcode %}