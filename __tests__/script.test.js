const { formatDateTime, validateForm, buildAFTNMessage } = require('../src/script');

describe('formatDateTime', () => {
  test('formats ISO string to YYYYMMDDHHMM', () => {
    const result = formatDateTime('2025-06-17T12:34:00Z');
    expect(result).toBe('202506171234');
  });

  test('returns empty string for falsy input', () => {
    expect(formatDateTime('')).toBe('');
    expect(formatDateTime(null)).toBe('');
  });
});

describe('validateForm', () => {
  test('validates correct data', () => {
    const data = { origin: 'EGGWYFYX', destination: 'EGGGYNYX', location: 'EGLL' };
    const validation = validateForm(data);
    expect(validation.valid).toBe(true);
  });

  test('rejects wrong AFTN length', () => {
    const data = { origin: 'EGGW', destination: 'EGGGYNYX', location: 'EGLL' };
    const validation = validateForm(data);
    expect(validation.valid).toBe(false);
  });
});

describe('buildAFTNMessage', () => {
  test('builds minimal message', () => {
    const input = {
      priority: 'GG',
      origin: 'EGGWYFYX',
      destination: 'EGGGYNYX',
      location: 'EGLL',
      requestType: 'ALL',
      timeFrom: '2025-06-17T14:00:00Z',
      timeTo: '2025-06-18T14:00:00Z',
      remarks: 'Test'
    };
    const output = buildAFTNMessage(input);
    expect(output).toContain('GG EGGGYNYX');
    expect(output).toContain('RQN');
    expect(output).toContain('A)EGLL');
    expect(output).toContain('D)ALL NOTAMS REQUESTED');
  });
});
