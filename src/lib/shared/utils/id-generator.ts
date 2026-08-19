let sequenceCounter = 100;

export function generateEntityId(prefix: string = 'id'): string {
  sequenceCounter += 1;
  const timestampPortion = Date.now().toString(36);
  const randomPortion = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestampPortion}-${randomPortion}-${sequenceCounter}`;
}
