import { randomUUID } from 'node:crypto';

import { CloudEvent, type CloudEventV1 } from 'cloudevents';
import { addMonths, parseISO } from 'date-fns';

import type { IncomingServiceMessage, OutgoingServiceMessage } from './messages.js';

const INCOMING_SERVICE_MESSAGE_TYPE =
  'tech.relaycorp.awala.endpoint-internet.incoming-service-message';
const OUTGOING_SERVICE_MESSAGE_TYPE =
  'tech.relaycorp.awala.endpoint-internet.outgoing-service-message';

const OUTGOING_MESSAGE_TTL_MONTHS = 3;

const DEFAULT_SENDER_ID_KEYWORD = 'default';

/**
 * Convert an incoming `CloudEvent` to an incoming service message.
 * @param event The incoming `CloudEvent`.
 * @returns The incoming service message.
 */
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

/**
 * Convert an outgoing service message to a `CloudEvent`.
 * @param message The outgoing service message.
 * @returns The equivalent `CloudEvent`.
 */
export function makeOutgoingCloudEvent(message: OutgoingServiceMessage): CloudEvent<Buffer> {
  const creationDate = message.creationDate ?? new Date();
  const expiry = message.expiryDate ?? addMonths(creationDate, OUTGOING_MESSAGE_TTL_MONTHS);
  return new CloudEvent({
    type: OUTGOING_SERVICE_MESSAGE_TYPE,
    id: message.parcelId ?? randomUUID(),
    time: creationDate.toISOString(),
    expiry: expiry.toISOString(),
    source: message.senderId ?? DEFAULT_SENDER_ID_KEYWORD,
    subject: message.recipientId,
    datacontenttype: message.contentType,
    data: message.content,
  });
}
