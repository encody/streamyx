export interface Payload {
  streamKey: string;
  streamIngestUrl: string;
}

export function createPayloadBase64Url(
  webinarId: number,
  streamKey: string,
  streamIngestUrl: string,
): string {
  const payload: Payload = {
    streamKey,
    streamIngestUrl,
  };
  const payloadString = JSON.stringify(payload);
  return (
    '/webinar/' +
    webinarId +
    '?p=' +
    Buffer.from(payloadString).toString('base64')
  );
}

export function decodePayloadBase64(payloadBase64: string): Payload {
  const payloadString = Buffer.from(payloadBase64, 'base64').toString();
  return JSON.parse(payloadString) as Payload;
}
