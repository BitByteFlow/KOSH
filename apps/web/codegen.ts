import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5000/graphql",
  documents: ['app/**/*.{ts,tsx}',
    'components/**/*.tsx',
    'modules/**/*.tsx',
    'services/**/*.tsx',
    'lib/**/*.tsx'
  ],
  generates: {
    './gql/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;