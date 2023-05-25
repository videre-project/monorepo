/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';

import { toSnakeCase, toCamelCase, toPascalCase, toKebabCase } from './strings';


describe('toSnakeCase', () => {
  it('converts camelCase input text', () => {
    expect(toSnakeCase('fooBar')).toBe('foo_bar');
    expect(toSnakeCase('fooBarBaz')).toBe('foo_bar_baz');
    expect(toSnakeCase('fooBarBazBang')).toBe('foo_bar_baz_bang');
  });
  it('converts PascalCase input text', () => {
    expect(toSnakeCase('FooBar')).toBe('foo_bar');
    expect(toSnakeCase('FooBarBaz')).toBe('foo_bar_baz');
    expect(toSnakeCase('FooBarBazBang')).toBe('foo_bar_baz_bang');
  });
  it('converts kebab-case input text', () => {
    expect(toSnakeCase('foo-bar')).toBe('foo_bar');
    expect(toSnakeCase('foo-bar-baz')).toBe('foo_bar_baz');
    expect(toSnakeCase('foo-bar-baz-bang')).toBe('foo_bar_baz_bang');
  });
  it('converts mixed format input text', () => {
    expect(toSnakeCase('foo1_bar-3baz')).toBe('foo1_bar_3baz');
    expect(toSnakeCase('foo1_bar-3Baz')).toBe('foo1_bar_3_baz');
    expect(toSnakeCase('foo-bar2_baz3')).toBe('foo_bar2_baz3');
  });
});

describe('toCamelCase', () => {
  it('converts snake_case input text', () => {
    expect(toCamelCase('foo_bar')).toBe('fooBar');
    expect(toCamelCase('foo_bar_baz')).toBe('fooBarBaz');
    expect(toCamelCase('foo_bar_baz_bang')).toBe('fooBarBazBang');
  });
  it('converts PascalCase input text', () => {
    expect(toCamelCase('FooBar')).toBe('fooBar');
    expect(toCamelCase('FooBarBaz')).toBe('fooBarBaz');
    expect(toCamelCase('FooBarBazBang')).toBe('fooBarBazBang');
  });
  it('converts kebab-case input text', () => {
    expect(toCamelCase('foo-bar')).toBe('fooBar');
    expect(toCamelCase('foo-bar-baz')).toBe('fooBarBaz');
    expect(toCamelCase('foo-bar-baz-bang')).toBe('fooBarBazBang');
  });
});

describe('toPascalCase', () => {
  it('converts snake_case input text', () => {
    expect(toPascalCase('foo_bar')).toBe('FooBar');
    expect(toPascalCase('foo_bar_baz')).toBe('FooBarBaz');
    expect(toPascalCase('foo_bar_baz_bang')).toBe('FooBarBazBang');
  });
  it('converts camelCase input text', () => {
    expect(toPascalCase('fooBar')).toBe('FooBar');
    expect(toPascalCase('fooBarBaz')).toBe('FooBarBaz');
    expect(toPascalCase('fooBarBazBang')).toBe('FooBarBazBang');
  });
  it('converts kebab-case input text', () => {
    expect(toPascalCase('foo-bar')).toBe('FooBar');
    expect(toPascalCase('foo-bar-baz')).toBe('FooBarBaz');
    expect(toPascalCase('foo-bar-baz-bang')).toBe('FooBarBazBang');
  });

  it('converts mixed format input text', () => {
    expect(toPascalCase('foo1_bar3-baz')).toBe('Foo1Bar3Baz');
    expect(toPascalCase('foo1_bar-3Baz')).toBe('Foo1Bar3Baz');
    expect(toPascalCase('foo-bar2_baz3')).toBe('FooBar2Baz3');
  });
});

describe('toKebabCase', () => {
  it('converts snake_case input text', () => {
    expect(toKebabCase('foo_bar')).toBe('foo-bar');
    expect(toKebabCase('foo_bar_baz')).toBe('foo-bar-baz');
    expect(toKebabCase('foo_bar_baz_bang')).toBe('foo-bar-baz-bang');
  });
  it('converts camelCase input text', () => {
    expect(toKebabCase('fooBar')).toBe('foo-bar');
    expect(toKebabCase('fooBarBaz')).toBe('foo-bar-baz');
    expect(toKebabCase('fooBarBazBang')).toBe('foo-bar-baz-bang');
  });
  it('converts PascalCase input text', () => {
    expect(toKebabCase('FooBar')).toBe('foo-bar');
    expect(toKebabCase('FooBarBaz')).toBe('foo-bar-baz');
  });
});
