/* eslint-disable @typescript-eslint/no-require-imports */
// Flat config CJS fallback for ESLint v9 environments
// Mirrors the existing eslint.config.mjs content but in CommonJS form
const { defineConfig, globalIgnores } = require('eslint/config');
const nextVitals = require('eslint-config-next/core-web-vitals');
const nextTs = require('eslint-config-next/typescript');

module.exports = defineConfig([
	...nextVitals,
	...nextTs,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
	]),
]);
