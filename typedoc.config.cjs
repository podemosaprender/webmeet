//SEE: https://www.npmjs.com/package/typedoc-plugin-replace-text#configuration

plantumlEncoder= require('plantuml-encoder');

/** @type { import('typedoc').TypeDocOptionMap & import('typedoc-plugin-replace-text').Config } */
module.exports = {
	out: "public/doc", //A: during dev to see the docs on the same server
	readme: "README.md",
	entryPoints: ["src/**"],
	entryPointStrategy: "expand",
	excludeNotDocumented: false,
	tsconfig: "tsconfig.json",
	useTsLinkResolution: true,
	categorizeByGroup: false, //A: keep items of the same category together
	sort: ["source-order"], //SEE: https://typedoc.org/options/organization/#sort
	visibilityFilters: {
		protected: false,
		private: false,
		inherited: true,
		external: false,
		"@alpha": false,
		"@beta": false
	},
	navigation: {
		includeCategories: false,
		includeGroups: false,
		includeFolders: true
	},
	plugin: [
		"typedoc-plugin-missing-exports",
		"typedoc-plugin-replace-text",
	],
	replaceText: {
		inCodeCommentText: true,
		inCodeCommentTags: true,
		inIncludedFiles: true,
		replacements: [
			{
				pattern: /<uml>([^]*?)<\/uml>/,
					flags: "gi",
					replace: (_, uml) => {
						return (
						"\n\n![diagram](https://www.plantuml.com/plantuml/png/" + 
							plantumlEncoder.encode("!theme cyborg-outline\n"+uml) + 
							")\n\n"
					);
					},
					},
					],
					},
					};
