export function generateEntityId(_prefix: string = 'id'): string {
  return crypto.randomUUID();
}
