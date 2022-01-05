import { toPascalCase } from "@videre/database";
import { MTGO } from '@videre/magic';

/**
 * Test URL Query Parameters
 */

import { getParams, removeDuplicates } from '../parameters/url-parse/params.js';
import { getQueryArgs, groupQuery } from '../parameters/url-parse/query.js';

describe('URL Parse', () => {
  // Handle parameter-level parsing
  describe('params', () => {
    describe('getParams', () => {
      const query = { id: 1, uid: 2, other: 3 };
      it('maps query params to prop', () => {
        const output = getParams(query, 'uid');
        expect(output).toEqual([2]);
      });
      it('maps query params to aliases', () => {
        const output = getParams(query, 'id', 'uid');
        expect(output).toEqual([1, 2]);
      });
    });
    describe('removeDuplicates', () => {
      const query = { id: 1, id: [2, 3], uid: 4 };
      it('removes duplicate parameters', () => {
        const output = removeDuplicates(query);
        expect(output).toEqual({ id: 2, uid: 4 });
      });
    });
  });
  // Handle query-level parsing
  describe('query', () => {
    // Parse express query parameters
    describe('getQueryArgs', () => {
      // Mock express url param handling with query object keys.
      const query = {
        q: 'condition1>=value1', // Test 'query' param aliases
        query: 'condition2>=value2 condition3!=value3'
      };
      const output = getQueryArgs(query);
      it('handles duplicate queries', () => {
        expect(output).toHaveLength(2);
      });
      it('splits query conditions into a structured array', () => {
        expect(output).toEqual([
          [
            'condition1>=value1'
          ],
          [
            'condition2>=value2',
            'condition3!=value3'
          ]
        ]);
      });
    });
    // Group query conditions based on primary (grouping) condition
    describe('groupQuery', () => {
      // Mock query condition groups
      const query = {
        query: [
          'condition0=value0',
          'condition1>=value1',
          'condition2<=2.1',
          'condition3>=3',
          'condition4<=2',
          'condition1=value2',
          'condition2!=-4'
        ].join(' ')
      };
      it('groups query conditions on main key', () => {
        const output = groupQuery({
          query: query,
          // main key
          mainParam: 'condition1',
          // additional arguments
          param1: 'condition0',
          param2: 'condition2',
          param3: 'condition3'
        });
        expect(output).toEqual([
          { "group": 1, "operator": "=",  "parameter": "condition0",  "value": "value0" },
          { "group": 1, "operator": ">=", "parameter": "condition1",  "value": "value1" },
          { "group": 1, "operator": "<=", "parameter": "condition2",  "value": 2.1      },
          { "group": 1, "operator": ">=", "parameter": "condition3",  "value": 3        },
          { "group": 2, "operator": "=",  "parameter": "condition1",  "value": "value2" },
          { "group": 2, "operator": "!=", "parameter": "condition2",  "value": -4       }
        ]);
      });
      it('handles multiple queries', () => {
        const { query: _query } = query;
        const output = groupQuery({
          query: { q: _query, query: _query },
          // main key
          mainParam: 'condition1',
          // additional arguments
          param1: 'condition0',
          param2: 'condition2',
          param3: 'condition3'
        });
        expect(output).toHaveLength(2 * (_query.split(' ').length - 1)); // 12
      });
    });
  });
});
/**
 * Test Global Parameters
 */

import parseDateRange, { validateDate, formatDate } from '../parameters/date-range.js';
import parseUIDs from '../parameters/uids.js';

describe('Globals', () => {
  // Handle date range validation
  describe('date-range', () => {
    // Date validation
    describe('validateDate', () => {
      it('validates a single input date', () => {
        const output = validateDate('12/31/1969');
        expect(output).toBe(true);
      });
      it('rejects non-standard, ambiguous date formats', () => {
        const output = validateDate('31/1969/12');
        expect(output).toBe(false);
      });
    });
    // Date preprocessing
    describe('formatDate', () => {
      it('reformats a single input date string to a specified standard', () => {
        const output = formatDate('1969/12/31');
        expect(output).toBe('12/31/1969');
      });
      it('reformats a single input date object to a specified standard', () => {
        const output = formatDate(new Date('1969/12/31'));
        expect(output).toBe('12/31/1969');
      });
    });
    // Condition handling
    it('handles min_date and max_date override of time_interval', () => {
      const output = parseDateRange('12/17/1969', '12/31/1969', 0, 14);
      expect(output).toEqual({ min_date: '12/17/1969', max_date: '12/31/1969' });
    });
    it('handles offset of min_date and max_date', () => {
      const output = parseDateRange('12/17/1969', '12/31/1969', 14);
      expect(output).toEqual({ min_date: '12/31/1969', max_date: '1/14/1970' });
    });
    it('bounds max_date to min_date and time_interval constraint', () => {
      const output = parseDateRange('12/31/1969', null, -14, 14);
      expect(output).toEqual({ min_date: '12/17/1969', max_date: '12/31/1969' });
    });
    it('bounds min_date to max_date and time_interval constraint', () => {
      const output = parseDateRange(null, '1/14/1970', -14, 14);
      expect(output).toEqual({ min_date: '12/17/1969', max_date: '12/31/1969' });
    });
  });
  // Handle uid validation
  describe('uids', () => {
    // Handle alphanumerical uids
    describe('alphanumerical', () => {
      const uids = [
        '##~&__*04dae32c-6db5-11ec-90d6-0242ac120003', // version 1 UUID
      // ^^^^^^ invalid characters
        '7475593e-7fb7-41f7##~&__-a1c4-1bc2fd8d5141', // version 4 UUID
      //                   ^^^^^^ invalid characters
      ];
      const expected = [
        '04dae32c-6db5-11ec-90d6-0242ac120003',
        '7475593e-7fb7-41f7-a1c4-1bc2fd8d5141',
      ];
  
      it('validates a single input alphanumerical uid', () => {
        const output = uids.map(uid => parseUIDs(uid, true));
        expect(output).toEqual(expected);
      });
      it('validates multiple input alphanumerical uids', () => {
        const output = parseUIDs(uids, true);
        expect(output).toEqual(expected);
      });
    });
    // Handle numerical ids
    describe('numerical', () => {
      const uids = [
        '20-10563145-8', // DNI based id
      //   ^        ^ invalid characters
        '#12361865' // MTGO event id
      // ^ invalid character
      ];
      const expected = [
        20105631458,
        12361865
      ];
  
      it('validates a single input numerical uid', () => {
        const output = uids.map(uid => parseUIDs(uid, false));
        expect(output).toEqual(expected);
      });
      it('validates multiple input numerical uids', () => {
        const output = parseUIDs(uids, false);
        expect(output).toEqual(expected);
      });
    });
  });
});

/**
 * Test Event Parameters
 */

import parseFormats from '../parameters/events/formats.js';
import parseEventTypes from '../parameters/events/types.js';

describe('Events', () => {
  // Handle event formats
  describe('formats', () => {
    const expected = MTGO.FORMATS.map(toPascalCase);
  
    it('validates a single input format', () => {
      const output = MTGO.FORMATS.map(parseFormats);
      expect(output).toEqual(expected);
    });
    it('validates multiple input formats', () => {
      const output = parseFormats(MTGO.FORMATS);
      expect(output).toEqual(expected);
    });
  });
  // Handle event types
  describe('types', () => {
    const expected = MTGO.EVENT_TYPES.map(toPascalCase);
  
    it('validates a single input event type', () => {
      const output = MTGO.EVENT_TYPES.map(parseEventTypes);
      expect(output).toEqual(expected);
    });
    it('validates multiple input event types', () => {
      const output = parseEventTypes(MTGO.EVENT_TYPES);
      expect(output).toEqual(expected);
    });
  });
});