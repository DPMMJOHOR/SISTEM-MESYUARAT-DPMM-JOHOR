// ============================================================
// UNIT TESTS FOR CRITICAL FUNCTIONS
// Using Vitest testing framework
// ============================================================

import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPhone, isValidIC } from '../../src/utils/shared-utils.js';

describe('Validation Functions', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate Malaysian phone numbers', () => {
      expect(isValidPhone('+60-12-3456789')).toBe(true);
      expect(isValidPhone('012-3456789')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });

  describe('isValidIC', () => {
    it('should validate Malaysian IC format', () => {
      expect(isValidIC('123456-12-1234')).toBe(true);
      expect(isValidIC('880101-01-1234')).toBe(true);
    });

    it('should reject invalid IC format', () => {
      expect(isValidIC('123456')).toBe(false);
      expect(isValidIC('123456-12')).toBe(false);
    });
  });
});

describe('Formatting Functions', () => {
  describe('formatIC', () => {
    it('should format IC number correctly', () => {
      expect(formatIC('123456121234')).toBe('123456-12-1234');
    });

    it('should return original if invalid length', () => {
      expect(formatIC('123456')).toBe('123456');
    });
  });

  describe('formatPhone', () => {
    it('should format phone number correctly', () => {
      expect(formatPhone('60123456789')).toBe('+60-12-3456789');
    });

    it('should return original if empty', () => {
      expect(formatPhone('')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format date to Malaysian format', () => {
      const date = new Date('2026-01-15');
      expect(formatDate(date)).toBe('15/01/2026');
    });

    it('should return empty string if no date', () => {
      expect(formatDate(null)).toBe('');
    });
  });
});
