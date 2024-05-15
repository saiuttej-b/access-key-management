import * as bcrypt from 'bcrypt';
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

/**
 *
 * @param value string
 * @returns string
 *
 * This function hashes the value using `bcrypt` library
 * and returns the hashed value
 */
export function hashValue(value: string) {
  return bcrypt.hash(value, 10);
}

/**
 *
 * @param value string
 * @param hash string
 * @returns Promise<boolean>
 *
 * This function compares the value with the hash
 * and returns a boolean
 */
export function compareHash(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}
