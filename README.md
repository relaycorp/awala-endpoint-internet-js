# `@relaycorp/awala-endpoint-internet`

High-level JS library to process [Awala Internet Endpoint](https://docs.relaycorp.tech/awala-endpoint-internet/)-compatible [CloudEvents](https://www.npmjs.com/package/cloudevents).

## Convert incoming CloudEvent to service message

To convert an incoming _service message_ wrapped in a `CloudEvent`, simply call `makeIncomingServiceMessage`.

For example, the following [Fastify](https://fastify.dev) route accepts CloudEvents in [binary mode](https://github.com/cloudevents/spec/blob/main/cloudevents/bindings/http-protocol-binding.md#31-binary-content-mode) and the converts them to service messages:

```typescript
import { CloudEventV1, HTTP } from 'cloudevents';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

export async function registerEventReceiver(server: FastifyInstance): Promise<void> {
  // Accept any content type
  server.removeAllContentTypeParsers();
  server.addContentTypeParser('*', { parseAs: 'buffer' }, (_req, payload, next) => {
    next(null, payload);
  });

  server.post('/', async (request, reply) => {
    let event: CloudEventV1<Buffer>;
    try {
      event = HTTP.toEvent({ headers: request.headers, body: request.body });
    } catch (err) {
      // Malformed CloudEvent
      return reply.status(400).send({ reason: err.message });
    }

    const message = makeIncomingServiceMessage(event);
    request.log.info({ parcelId: message.parcelId }, 'Incoming service message');

    return reply.status(204).send();
  });
}
```

## Convert outgoing service message to CloudEvent

To convert an outgoing _service message_ to a `CloudEvent`, simply call `makeOutgoingCloudEvent`.

For example:

```typescript
import { makeOutgoingCloudEvent, OutgoingServiceMessage } from '@relaycorp/awala-endpoint-internet';

const outgoingServiceMessage: OutgoingServiceMessage = {
  recipientId: '<Insert Awala Endpoint Id of recipient>',
  contentType: 'application/vnd.your-company.your-service.Greeting',
  data: Buffer.from('Hello, world!'),
};
const outgoingEvent = makeOutgoingCloudEvent(outgoingServiceMessage);
```

Finally, send the `outgoingEvent` to the Awala Internet Endpoint using your [cloudevents](https://www.npmjs.com/package/cloudevents) emitter. For example:

```typescript
import { httpTransport, emitterFor } from 'cloudevents';

const emit = emitterFor(httpTransport('https://cloudevents-broker.com'));
emit(event);
```

## API documentation

See [API documentation](https://docs.relaycorp.tech/awala-endpoint-internet-js/).
