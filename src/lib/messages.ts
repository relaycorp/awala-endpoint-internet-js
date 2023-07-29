interface ServiceMessageBase {
  readonly senderId: string;
  readonly recipientId: string;
  readonly contentType: string;
  readonly content: Buffer;
}

interface ServiceMessageExtra {
  readonly parcelId: string;
  readonly creationDate: Date;
  readonly expiryDate: Date;
}

export interface OutgoingServiceMessage extends ServiceMessageBase, Partial<ServiceMessageExtra> {}

export interface IncomingServiceMessage extends ServiceMessageBase, ServiceMessageExtra {}
