import { CloudEvent } from 'cloudevents';
import { addMonths, parseISO, setMilliseconds, subSeconds } from 'date-fns';

import { CE_CONTENT_TYPE, CE_DATA, CE_ID, CE_SOURCE } from '../testUtils/stubs.js';

import { makeIncomingServiceMessage, makeOutgoingCloudEvent } from './converters.js';
import type { OutgoingServiceMessage } from './messages.js';

describe('makeIncomingServiceMessage', () => {
  const event = new CloudEvent({
    id: CE_ID,
    type: 'tech.relaycorp.awala.endpoint-internet.incoming-service-message',
    source: CE_SOURCE,
    subject: 'recipient',
    time: setMilliseconds(new Date(), 0).toISOString(),
    expiry: setMilliseconds(addMonths(new Date(), 1), 0).toISOString(),
    datacontenttype: CE_CONTENT_TYPE,
    data: CE_DATA,
  });

  test('Event type should be that of an incoming service message', () => {
    const invalidEvent = event.cloneWith({ type: `not.${event.type}` });

    expect(() => makeIncomingServiceMessage(invalidEvent)).toThrow('Invalid event type');
  });

  test('Sender should be taken from event source', () => {
    const message = makeIncomingServiceMessage(event);

    expect(message.senderId).toBe(event.source);
  });

  test('Parcel id should be taken from event id', () => {
    const message = makeIncomingServiceMessage(event);

    expect(message.parcelId).toBe(event.id);
  });

  test('Creation date should be taken from event time', () => {
    const message = makeIncomingServiceMessage(event);

    const eventTime = parseISO(event.time!);
    expect(message.creationDate).toStrictEqual(eventTime);
  });

  describe('Expiry date', () => {
    test('Should be taken from event expiry', () => {
      const message = makeIncomingServiceMessage(event);

      const eventExpiry = parseISO(event.expiry as string);
      expect(message.expiryDate).toStrictEqual(eventExpiry);
    });

    test('Event should be refused if expiry is not set', () => {
      const invalidEvent = event.cloneWith({ expiry: undefined }, false);

      expect(() => makeIncomingServiceMessage(invalidEvent)).toThrow('Missing event expiry');
    });
  });

  describe('Recipient', () => {
    test('Should be taken from event subject', () => {
      const message = makeIncomingServiceMessage(event);

      expect(message.recipientId).toBe(event.subject);
    });

    test('Event should refused if subject is not set', () => {
      const invalidEvent = event.cloneWith({ subject: undefined });

      expect(() => makeIncomingServiceMessage(invalidEvent)).toThrow('Missing event subject');
    });
  });

  describe('Content type', () => {
    test('Should be taken from event data content type', () => {
      const message = makeIncomingServiceMessage(event);

      expect(message.contentType).toBe(event.datacontenttype);
    });

    test('Event should be refused if data content type is not set', () => {
      const invalidEvent = event.cloneWith({ datacontenttype: undefined });

      expect(() => makeIncomingServiceMessage(invalidEvent)).toThrow(
        'Missing event data content type',
      );
    });
  });

  describe('Content', () => {
    test('Should be taken from event data', () => {
      const message = makeIncomingServiceMessage(event);

      expect(message.content).toBe(event.data);
    });

    test('Event should be refused if data is not set', () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention,camelcase
      const invalidEvent = event.cloneWith({ data: undefined, data_base64: undefined });

      expect(() => makeIncomingServiceMessage(invalidEvent)).toThrow('Missing event data');
    });
  });
});

describe('makeOutgoingCloudEvent', () => {
  const message: OutgoingServiceMessage = {
    parcelId: 'parcel',
    senderId: 'sender',
    recipientId: 'recipient',
    contentType: CE_CONTENT_TYPE,
    content: CE_DATA,
  };

  test('Event type should be that of an outgoing service message', () => {
    const event = makeOutgoingCloudEvent(message);

    expect(event.type).toBe('tech.relaycorp.awala.endpoint-internet.outgoing-service-message');
  });

  describe('Event id', () => {
    test('Should be taken from service message if set', () => {
      const event = makeOutgoingCloudEvent(message);

      expect(event.id).toBe(message.parcelId);
    });

    test('Should be generated if not set', () => {
      const event = makeOutgoingCloudEvent({ ...message, parcelId: undefined });

      expect(event.id).toMatch(/[\da-f-]{36}/u);
    });
  });

  describe('Creation date', () => {
    test('Should be taken from service message if set', () => {
      const creationDate = subSeconds(new Date(), 30);

      const event = makeOutgoingCloudEvent({ ...message, creationDate });

      expect(parseISO(event.time!)).toMatchObject(creationDate);
    });

    test('Should default to now if not set', () => {
      const beforeDate = new Date();

      const event = makeOutgoingCloudEvent({ ...message, creationDate: undefined });

      const afterDate = new Date();
      const creationDate = parseISO(event.time!);
      expect(creationDate).toBeAfterOrEqualTo(beforeDate);
      expect(creationDate).toBeBeforeOrEqualTo(afterDate);
    });
  });

  describe('Expiry', () => {
    test('Should be taken from service message if set', () => {
      const expiry = new Date();

      const event = makeOutgoingCloudEvent({ ...message, expiryDate: expiry });

      expect(parseISO(event.expiry as string)).toMatchObject(expiry);
    });

    test('Should default to 3 months from creation date', () => {
      const creationDate = subSeconds(new Date(), 30);

      const event = makeOutgoingCloudEvent({ ...message, creationDate, expiryDate: undefined });

      const expiry = parseISO(event.expiry as string);
      expect(expiry).toStrictEqual(addMonths(creationDate, 3));
    });

    test('Should default to 3 months from now if creation date is not set either', () => {
      const beforeDate = new Date();

      const event = makeOutgoingCloudEvent({ ...message, expiryDate: undefined });

      const afterDate = new Date();
      const expiry = parseISO(event.expiry as string);
      expect(expiry).toBeAfterOrEqualTo(addMonths(beforeDate, 3));
      expect(expiry).toBeBeforeOrEqualTo(addMonths(afterDate, 3));
    });
  });

  test('Event should should be the message sender id', () => {
    const event = makeOutgoingCloudEvent(message);

    expect(event.source).toBe(message.senderId);
  });

  test('Event subject should be the message recipient id', () => {
    const event = makeOutgoingCloudEvent(message);

    expect(event.subject).toBe(message.recipientId);
  });

  test('Event data content type should be the message content type', () => {
    const event = makeOutgoingCloudEvent(message);

    expect(event.datacontenttype).toBe(message.contentType);
  });

  test('Event data should be the message content', () => {
    const event = makeOutgoingCloudEvent(message);

    expect(event.data).toBe(message.content);
  });
});
