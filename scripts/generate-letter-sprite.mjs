#!/usr/bin/env node

/**
 * Builds public/svg/letter_spritesheet.svg from the individual SVG files in
 * public/svg/singleLetters.
 *
 * File names follow "<letter>_<variant>.svg". The generated symbol IDs use
 * "<letter>_0_<variant>" to match the references in logo.component.ts.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const inputDirectory = path.join(projectRoot, 'public', 'svg', 'singleLetters');
const outputFile = path.join(projectRoot, 'public', 'svg', 'letter_spritesheet.svg');

function naturalCompare(left, right) {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });
}

function getAttribute(svg, attribute) {
  const match = svg.match(new RegExp(`(?:^|\\s)${attribute}=["']([^"']+)["']`, 'm'));
  return match?.[1] ?? null;
}

function getSymbolId(fileName) {
  const stem = path.basename(fileName, '.svg');
  const match = stem.match(/^(.+)_(\d+)$/);

  if (!match) {
    throw new Error(`Invalid letter SVG name "${fileName}". Expected "<letter>_<variant>.svg".`);
  }

  const [, letter, variant] = match;
  return `${letter}_${variant}`;
}

function getSvgContents(svg, fileName) {
  const openingTag = svg.match(/<svg\b[^>]*>/i);
  const closingTagIndex = svg.toLowerCase().lastIndexOf('</svg>');

  if (!openingTag || closingTagIndex === -1) {
    throw new Error(`Invalid SVG markup in "${fileName}".`);
  }

  return svg
    .slice((openingTag.index ?? 0) + openingTag[0].length, closingTagIndex)
    .trim();
}

if (!fs.existsSync(inputDirectory)) {
  throw new Error(`Input directory not found: ${inputDirectory}`);
}

const files = fs.readdirSync(inputDirectory)
  .filter(fileName => fileName.toLowerCase().endsWith('.svg'))
  .sort(naturalCompare);

if (files.length === 0) {
  throw new Error(`No SVG files found in ${inputDirectory}`);
}

const usedIds = new Set();
const symbols = files.map(fileName => {
  const filePath = path.join(inputDirectory, fileName);
  const svg = fs.readFileSync(filePath, 'utf8');
  const id = getSymbolId(fileName);

  if (usedIds.has(id)) {
    throw new Error(`Duplicate generated symbol ID "${id}".`);
  }
  usedIds.add(id);

  const viewBox = getAttribute(svg, 'viewBox');
  if (!viewBox) {
    throw new Error(`Missing viewBox in "${fileName}".`);
  }

  const contents = getSvgContents(svg, fileName);
  return `  <symbol id="${id}" viewBox="${viewBox}">\n${contents}\n  </symbol>`;
});

const output = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">',
  ...symbols,
  '</svg>',
  '',
].join('\n');

fs.writeFileSync(outputFile, output, 'utf8');

console.log(`Generated ${path.relative(projectRoot, outputFile)} with ${symbols.length} symbols.`);
