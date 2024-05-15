import { compareHash, generateId, hashValue } from '../fn';

describe('fn functions(simple functions)', () => {
  describe('generateId', () => {
    it('should generate a unique id', () => {
      const id = generateId(new Date('2021-08-01T12:00:00.000Z'));

      expect(id).toBeDefined();
    });

    it('should generate a unique id', () => {
      const id = generateId();

      expect(id).toBeDefined();
    });
  });

  describe('hashValue', () => {
    it('should hash the value', async () => {
      const value = 'password';
      const hash = await hashValue(value);

      expect(hash).toBeDefined();
    });
  });

  describe('compareHash', () => {
    it('should compare the value and hash', async () => {
      const value = 'password';
      const hash = await hashValue(value);

      const result = await compareHash(value, hash);

      expect(result).toBe(true);
    });

    it('should compare the value and hash', async () => {
      const value = 'password';
      const hash = await hashValue(value);

      const result = await compareHash('wrong-password', hash);

      expect(result).toBe(false);
    });
  });
});
