import { useEffect, useRef, MutableRefObject } from 'react';
import Editor from '@monaco-editor/react';
import { Monaco, BeforeMount, OnMount, OnChange } from '@monaco-editor/react';
import { callMgr } from "../services/call";

function monacoSetup(monaco: Monaco) {
//FROM: https://microsoft.github.io/monaco-editor/playground.html?source=v0.45.0#example-extending-language-services-configure-javascript-defaults
// Add additional d.ts files to the JavaScript language service and change.
// Also change the default compilation options.
// The sample below shows how a class Facts is declared and introduced
// to the system and how the compiler is told to use ES6 (target=2).

// validation settings
monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
	noSemanticValidation: true,
	noSyntaxValidation: false,
});

window.xm= monaco
// compiler options
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
	allowNonTsExtensions: true,
    target: monaco.languages.typescript.ScriptTarget.Latest,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
 });
 
// extra libraries
var libSource = [
	"declare class Facts {",
	"    /**",
	"     * Returns the next fact",
	"     */",
	"    static next():string",
	"}",
].join("\n");
var libUri = "ts:filename/facts.d.ts";
monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
// When resolving definitions and references, the editor will try to use created models.
// Creating a model for the library allows "peek definition/references" commands to work with the library.
monaco.editor.createModel(libSource, "typescript", monaco.Uri.parse(libUri));


}
const someJsCode = [
	'"use strict";',
	"",
	"class Chuck {",
	"    greet() {",
	"        return Facts.next();",
	"    }",
	"    render() {",
	"       return (<div>{zarlanga}</div>)",
	"   }",
	"}",
].join("\n");

export function EditorView() {
  const monacoRef = useRef(null);

	const handleEditorChange: OnChange = (value: string, event: any) => {
		console.log("EditorChange",value, event)
	}

	const handleEditorWillMount= (monaco: Monaco) => {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
		monacoSetup(monaco)
  }

	const handleEditorDidMount: OnMount = (_ignore: any, monaco: Monaco) => {
    monacoRef.current = monaco;
  } 

  return (
    <Editor
      height="80vh"
      defaultValue={someJsCode}
      defaultLanguage="javascript"
			theme="vs-dark"
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
			onChange={handleEditorChange}
    />
  );
}

