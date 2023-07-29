import { randomUUID } from 'node:crypto';

import { CloudEvent, type CloudEventV1 } from 'cloudevents';
import { addMonths, parseISO } from 'date-fns';

import type { IncomingServiceMessage, OutgoingServiceMessage } from './messages.js';

const INCOMING_SERVICE_MESSAGE_TYPE =
  'tech.relaycorp.awala.endpoint-internet.incoming-service-message';
const OUTGOING_SERVICE_MESSAGE_TYPE =
  'tech.relaycorp.awala.endpoint-internet.outgoing-service-message';

const OUTGOING_MESSAGE_TTL_MONTHS = 3;

export function makeIncomingServiceMessage(event: CloudEventV1<Buffer>): IncomingServiceMessage {
  if (event.type !== INCOMING_SERVICE_MESSAGE_TYPE) {
    throw new Error('Invalid event type');
  }
  if (event.subject === undefined) {
    throw new Error('Missing event subject');
  }
  if (event.expiry === undefined) {
    throw new Error('Missing event expiry');
  }
  if (event.datacontenttype === undefined) {
    throw new Error('Missing event data content type');
  }
  if (event.data === undefined) {
    throw new Error('Missing event data');
  }
  return {
    creationDate: parseISO(event.time!),
    expiryDate: parseISO(event.expiry as string),
    parcelId: event.id,
    senderId: event.source,
    recipientId: event.subject,
    contentType: event.datacontenttype,
    content: event.data,
  };
}

export function makeOutgoingCloudEvent(options: OutgoingServiceMessage): CloudEvent<Buffer> {
  const time = options.creationDate ? options.creationDate.toISOString() : undefined;
  const expiry = options.expiryDate ?? addMonths(new Date(), OUTGOING_MESSAGE_TTL_MONTHS);
  return new CloudEvent({
    type: OUTGOING_SERVICE_MESSAGE_TYPE,
    id: options.parcelId ?? randomUUID(),
    time,
    expiry: expiry.toISOString(),
    source: options.senderId,
    subject: options.recipientId,
    datacontenttype: options.contentType,
    data: options.content,
  });
}
