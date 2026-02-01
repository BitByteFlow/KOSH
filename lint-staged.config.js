// export default {
//   '{apps,packages}/**/*.{js,ts,jsx,tsx}': (files) =>
//     `bunx biome lint --write --config-path=biome-staged.json ${files.join(' ')}`,

//   'packages/db/schema.prisma': ['prisma format'],
// };
// lint-staged.config.js
module.exports = {
  "{apps,packages}/**/*.{js,ts,jsx,tsx}": (files) =>
    `bunx biome lint --write --config-path=biome-staged.json ${files.join(" ")}`,
  "packages/db/schema.prisma": ["prisma format"]
};

