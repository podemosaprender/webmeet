//SEE: https://www.npmjs.com/package/typedoc-plugin-replace-text#configuration

plantumlEncoder= require('plantuml-encoder');

/** @type { import('typedoc').TypeDocOptionMap & import('typedoc-plugin-replace-text').Config } */
module.exports = {
	out: "docs",
	readme: "README.md",
	entryPoints: ["src/**"],
	entryPointStrategy: "expand",
	excludeNotDocumented: false,
	tsconfig: "tsconfig.json",
	useTsLinkResolution: true,
	categorizeByGroup: true,
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
