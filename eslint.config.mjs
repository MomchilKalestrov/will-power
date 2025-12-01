import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import nextPlugin from '@next/eslint-plugin-next'
import tseslint from 'typescript-eslint'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'src/components/ui/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
        ...nextPlugin.configs.recommended.rules,

        ...tseslint.configs.recommended.rules,
        'react-hooks/immutability': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'react-hooks/preserve-manual-memoization': 'off',
        
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
        
        '@next/next/no-css-tags': 'off',
        '@next/next/no-assign-module-variable': 'off',
        
        'no-var': 'off'
    },
  }
])
 
export default eslintConfig