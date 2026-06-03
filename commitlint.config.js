module.exports = {
    extends: ['@commitlint/config-angular'],

    rules: {
        'type-enum': () => [
            2,
            'always',
            ['build', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'chore', 'bump']
        ],
        'scope-enum': () => [
            2,
            'always',
            ['studify', 'shared', 'ui', 'feature', 'data-access', 'utils', 'reader', 'content', 'repo', 'deps']
        ],
        'body-max-line-length': () => [2, 'always', 100],
        'header-max-length': () => [2, 'always', 120]
    }
};
