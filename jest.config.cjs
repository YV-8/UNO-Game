module.exports = {
    testEnvironment: 'node',

    transform: {
        '^.+\\.js$': 'babel-jest'
    },

    testMatch: [
        '**/test/**/*.test.js'
    ],

    clearMocks: true,
    verbose: true,

    collectCoverage: false, // actívate --coverage
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/logic/services/**/*.js',
        'src/presentation/controllers/**/*.js',
        'src/dataAccess/repositories/**/*.js',
        '!src/dataAccess/models/**',
        '!src/dataAccess/database.js'
    ],
    coveragePathIgnorePatterns: ['/node_modules/'],

    setupFilesAfterEnv: ['<rootDir>/src/test/setup.js']
};