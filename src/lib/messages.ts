interface ServiceMessageBase {
  /**
   * The Awala endpoint id of the recipient of the parcel that encapsulated the service message.
   */
  readonly recipientId: string;

  /**
   * The content type of the Awala service message.
   */
  readonly contentType: string;

  /**
   * The content of the Awala service message.
   */
  readonly content: Buffer;
}

interface ServiceMessageExtra {
  /**
   * The Awala endpoint id of the sender of the parcel that encapsulated the service message.
   */
  readonly senderId: string;

  /**
   * The id of the Awala parcel that encapsulated the service message.
   */
  readonly parcelId: string;

  /**
   * The creation date of the Awala parcel that encapsulated the service message.
   */
  readonly creationDate: Date;

  /**
   * The expiry date of the Awala parcel that encapsulated the service message.
   */
  readonly expiryDate: Date;
}

/**
 * An Awala service message to be sent to another Awala endpoint.
 */
export interface OutgoingServiceMessage extends ServiceMessageBase, Partial<ServiceMessageExtra> {}

/**
 * An Awala service message received from another Awala endpoint.
 */
export interface IncomingServiceMessage extends ServiceMessageBase, ServiceMessageExtra {}
