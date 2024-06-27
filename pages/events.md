---
title: Events
description:
image:
---

# Events

IntentJS events offer a simple implementation of the observer pattern, allowing you to listen to various events that occur within your application. Event classes are typically stored in the `app/events` directory, and listeners are stored in the `app/listeners` directory. When you create your first event and listeners, these directories will get created automatically.

Events provide a great mechanism to decouple your business logic which do not depend on each other. Let's understand it better with the help of an example: Let's say you are building a book store, when a user orders a book, we want to send them a notification.

1. Send "Order Successful" notification.
2. Send a notification to Seller as well.

See how the above mentioned points, do not depend on each other, they can run independently and complete their own specified task. Instead of coupling the logic, we can simply trigger an `OrderPlaced` event which listeners can receive and use to dispatch notifications.

## Generating Events and Listeners

### Using intent command

To quickly generate events and listeners, you can make use of `make:event` and `make:listener` commands.

```bash
node intent make:event OrerPlacedEvent
node intent make:listener SendOrderNotification --event=OrderPlacedEvent
```

For convenience, you can also invoke `make:event` and `make:listener` command without any arguments, it would automatically prompt you for the class names.

## Registering Events and Listeners

### Listeners Discovery

Since Listener classes make use of `@Listener` decorator to see if a particular class has any listener or not. You will need to register the class inside the providers in the `AppModule`

Let's look at the listener.

```typescript
import { ListenTo } from "@intentjs/core";

@ListensTo("order_placed_event")
export class SendOrderNotification {
  async handle(payload: Record<string, any>) {
    // ...
  }
}
```

```typescript
import { SendOrderNotification } from "./listeners";

@Module({
  providers: [SendOrderNotification],
})
export class AppModule {}
```

IntentJS will automatically scan the class and store it as a listener for the specific event. Also, it will look for `handle` method inside the listener class at the time of booting up the application.&#x20;

### Events Discovery

Since event classes are just normal class, we don't need to register them anywhere.&#x20;

## Defining Events

To define an Event, you can create an event class like below in the `app/events` directory. An event class is a data container which holds the information related to the event.

```typescript
import { Event } from "@intentjs/core";

export class OrderPlacedEvent extends Event {
  constructor(public order: OrderModel) {
    // ..
  }
}
```

As you can see, the event class doesn't contain any logic, and whatever data we pass to this event shall automatically be passed to all listeners.

{% hint style="info" %}
All of the listeners only receive the normalised form of the all the data passed to the event.
{% endhint %}

IntentJS converts the name of the event classes into snake case and looks for the listeners which are listening to the event. For example if the name of your event class is `OrderPlacedEvent`, IntentJS would trigger the event with the name of `order_placed_event`. If you would like to pass some custom name of the event, you can make use of the static `name` variable inside the event class.

```typescript
import { Event } from "@intentjs/core";

export class OrderPlacedEvent extends Event {
  static name = "custom_order_placed_event";

  constructor(public order: OrderModel) {
    // ..
  }
}
```

Now after specificing the event name, you will also need to update the listeners.

## Defining Listeners

Now, let's take a look at the listeners. Listeners receive the a single variable `payload` which encapsulates all of the data we passed inside the event which it is listening to.

```typescript
import { ListenTo } from "@intentjs/core";

@ListensTo("order_placed_event")
export class SendOrderNotification {
  async handle(payload: Record<string, any>) {
    // ...
  }
}
```

You can also use \`Listener\` class to register a closure based listener. These listeners are simple and straight-forward in the implementation, hence you can use them if your listener doesn't contain complex business logic.

```typescript
import { Listener } from "@intentjs/core";

Listener.on("order_placed_event");
```

## Dispatching Events

To dispatch an event, we can make use of the `emit` method on the event class. This method is available inside the `Event` from @intentjs/core. You can access the `emit` method after creating an instance of the event class.

Let's take a look on how to use the `emit` method.

```typescript
const order = { id: 123, product: "A book" };
const event = new OrderPlacedEvent(order);
event.emit();
```

If you would like to conditionally dispatch an event, you can make use of `emitIf` or `emitUnless` method.&#x20;

```typescript
const order = { id: 123, product: "A book" };
const event = new OrderPlacedEvent(order);
event.emitIf(condition);
```

```typescript
const order = { id: 123, product: "A book" };
const event = new OrderPlacedEvent(order);
event.emitUnless(condition);
```

For a better readability, IntentJS also ships and `Emit` method which accepts multiple events which can emit simulataneously.

```typescript
import { Emit } from '@intentjs/core';

Emit(
    new OrderPlacedEvent(order);
    new SomeOtherEvent(order);
)
```

Similar to the `emitIf` and `emitUnless` method, you can use `Emit.if` and `Emit.unless` methods to conditionally dispatch your events. The only change in this is that you pass the condition as the first logic.

```typescript
import { Emit, EmitUnless } from '@intentjs/core';

Emit.if(condition)
    .dispatch(
        new OrderPlacedEvent(order);
        new SomeOtherEvent(order)
    );

Emit.unless(condition)
    .dispatch(
        new OrderPlacedEvent(order);
        new SomeOtherEvent(order)
    );
```

## Queuable Events

If your listeners are going to perform slow tasks like sending notifications, emails or making an HTTP request, Queueable Events can be beneficial for you. Events internally make use of the IntentJS [queue system](queues.md) to do so.

Making an events queueable means it will be processed automatically via the configured queue. To make an event to go through queue, you will need to implement `ShouldQueue` interface. Doing so, you may define `connection`, `queue`, or `delay` properties.

```typescript
import { Event } from "@intentjs/core";

export class OrderPlacedEvent extends Event implements ShouldQueue {
  /**
   * The name of the connection on which the event should be sent to.
   * Leave it blank to use the configured queue for the connection.
   */
  public connection = "sqs";

  /**
   * The name of the queue on which the event should be sent to.
   * Leave it blank to use the configured queue for the connection.
   */
  public queue = "order_notifications";

  /**
   * The delay(in seconds) before the job should be processed.
   */
  public delay = 50;

  constructor(public order: OrderModel) {
    // ..
  }
}
```

If you would like to define the event's queue connection, queue name, or delay at the runtime, you can use `viaConnection`, `viaQueue` or `withDelay` methods.

```typescript
/**
 * Return the name of the listener's queue connection.
 */
function viaConnection(): string {
  return "sqs";
}

/**
 * Return the queue's name.
 */
function viaQueue(): string {
  return "order_notifications";
}

/**
 * Return the delay(in seconds) before the job should be processed.
 */
function withDelay(): number {
  return 60;
}
```

### Conditionally queueing events

Just like `emitIf` method, you can make use of `shouldQueue` method inside the event class to determine if the event should be queued and processed or not. Returning `true` will mean the event will be queued and processed, and `false` means it will neither be queued, nor be processed.

```typescript
function shouldQueue(): boolean {
  return this.order.isConfirmed;
}
```