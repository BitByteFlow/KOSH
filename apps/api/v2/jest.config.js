const { pathsToModuleNameMapper } = require('ts-jest');

module.exports = {
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: '.',
  roots: ['<rootDir>', '<rootDir>/../../../packages'],
  testEnvironment: 'node',
  testRegex: '.*\\.(test|int\\.spec)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          moduleResolution: 'node',
          resolvePackageJsonExports: false,
          target: 'es2022',
          allowJs: true,
          esModuleInterop: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          skipLibCheck: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^test/(.*)$': '<rootDir>/test/$1',
    '^@kosh/(.*)$': '<rootDir>/../../../packages/$1',
    '^(\\.\\.?\\/.+)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testTimeout: 180000,
  maxWorkers: 1,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: [],
  verbose: true,
  silent: false,
  extensionsToTreatAsEsm: [],
};
