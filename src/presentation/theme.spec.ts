import { DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';
import { describe, expect, it } from 'vitest';
import { alcohlyzerCssVariablesResolver, alcohlyzerTheme } from './theme';

describe('Alcohlyzer theme', () => {
  it('should use the custom brand palette as the primary color', () => {
    // Given: the application theme
    const theme = mergeMantineTheme(DEFAULT_THEME, alcohlyzerTheme);

    // When: the primary palette is resolved
    const primaryPalette = theme.colors[theme.primaryColor];

    // Then: it should match the approved brand colors exactly
    expect(theme.primaryColor).toBe('brand');
    expect(primaryPalette).toEqual([
      '#ecf5ff',
      '#dee6f3',
      '#bfcbdc',
      '#9eaec6',
      '#8296b4',
      '#6f86a8',
      '#647ea4',
      '#536c90',
      '#476083',
      '#385376',
    ]);
  });

  it('should define the approved dark canvas, surface, and text colors', () => {
    // Given: the resolved application theme
    const theme = mergeMantineTheme(DEFAULT_THEME, alcohlyzerTheme);

    // When: its CSS variables are generated
    const variables = alcohlyzerCssVariablesResolver(theme);

    // Then: the dark scheme should use the approved semantic colors
    expect(theme.white).toBe('#F3EFE5');
    expect(variables.dark).toMatchObject({
      '--mantine-color-body': '#121824',
      '--mantine-color-default': '#1C2637',
      '--mantine-color-text': '#F3EFE5',
      '--mantine-color-bright': '#F3EFE5',
      '--mantine-primary-color-contrast': '#F3EFE5',
    });
  });
});
