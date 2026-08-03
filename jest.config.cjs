console.log('============== ¡JEST SÍ ESTÁ LEYENDO ESTE ARCHIVO! ==============');
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

    collectCoverage: false, // actívalo con --coverage cuando quieras
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/logic/services/**/*.js',
        'src/dataAccess/repositories/**/*.js',
        '!src/dataAccess/models/**',       // Excluye explícitamente los modelos (¡los saca del reporte!)
        '!src/dataAccess/database.js'
    ],
    coveragePathIgnorePatterns: ['/node_modules/'],

    setupFilesAfterEnv: ['<rootDir>/src/test/setup.js']
};