interface ServiceMessage {
  readonly senderId: string;
  readonly recipientId: string;
  readonly contentType: string;
  readonly content: Buffer;
}

export interface OutgoingServiceMessage extends ServiceMessage {
  readonly parcelId?: string;
  readonly expiry?: Date;
}

export interface IncomingServiceMessage extends ServiceMessage {
  readonly parcelId: string;
}
