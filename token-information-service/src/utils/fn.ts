import { ulid } from 'ulidx';

/**
 *
 * @param date Date optional
 * @returns string
 *
 * This function generates a unique id
 * for now we are using `ulid` library to generate the id
 */
export function generateId(date?: Date) {
  return ulid(date?.getTime());
}
