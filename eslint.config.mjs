import nx from '@nx/eslint-plugin';
import importPlugin from 'eslint-plugin-import';

export default [
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    {
        ignores: [
            '**/dist',
            '**/node_modules',
            '**/assets/**',
            '**/vite.config.*.timestamp*',
            '**/vitest.config.*.timestamp*'
        ]
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
                    depConstraints: [
                        {
                            sourceTag: 'application:studify',
                            onlyDependOnLibsWithTags: ['scope:feature', 'scope:ui', 'scope:data-access', 'scope:utils']
                        },
                        {
                            sourceTag: 'scope:feature',
                            onlyDependOnLibsWithTags: ['scope:feature', 'scope:ui', 'scope:data-access', 'scope:utils']
                        },
                        {
                            sourceTag: 'scope:ui',
                            onlyDependOnLibsWithTags: ['scope:ui', 'scope:utils']
                        },
                        {
                            sourceTag: 'scope:data-access',
                            onlyDependOnLibsWithTags: ['scope:data-access', 'scope:utils']
                        },
                        {
                            sourceTag: 'scope:utils',
                            onlyDependOnLibsWithTags: ['scope:utils']
                        }
                    ]
                }
            ]
        }
    },
    {
        files: ['**/*.ts'],
        plugins: {import: importPlugin},
        settings: {
            'import/resolver': {
                typescript: {alwaysTryTypes: true}
            }
        },
        rules: {
            'import/order': [
                'error',
                {
                    alphabetize: {order: 'asc', caseInsensitive: false},
                    'newlines-between': 'always',
                    groups: ['external', 'builtin', 'internal', ['parent', 'sibling', 'index']],
                    pathGroups: [
                        {pattern: '{@angular/**,rxjs,rxjs/operators}', group: 'external', position: 'before'},
                        {pattern: '@studify/**', group: 'internal', position: 'before'}
                    ],
                    pathGroupsExcludedImportTypes: []
                }
            ],
            'import/no-duplicates': 'error',
            '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/explicit-function-return-type': [
                'error',
                {allowExpressions: true, allowConciseArrowFunctionExpressionsStartingWithVoid: true}
            ],
            'no-duplicate-imports': 'error',
            'prefer-object-spread': 'error',
            'prefer-template': 'error',
            yoda: 'error'
        }
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
        rules: {}
    }
];
