import { CodegenConfig } from "@graphql-codegen/cli";

const schemaUrl =
	process.env.GRAPHQL_URL ||
	process.env.NEXT_PUBLIC_GRAPHQL_URL ||
	"http://localhost:5000/graphql";

const config: CodegenConfig = {
	schema: schemaUrl,
	documents: [
		"app/**/*.{ts,tsx}",
		"components/**/*.{ts,tsx}",
		"modules/**/*.{ts,tsx}",
		"services/**/*.{ts,tsx}",
		"lib/**/*.{ts,tsx}",
		"hooks/**/*.{ts,tsx}",
		"actions/**/*.{ts,tsx}",
		"context/**/*.{ts,tsx}",
	],
	generates: {
		"./gql/": {
			preset: "client",
			plugins: [],
			presetConfig: {
				gqlTagName: "gql",
			},
		},
	},
	ignoreNoDocuments: true,
};

export default config;
