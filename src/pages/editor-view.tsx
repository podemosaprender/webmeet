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
	if (monaco.editor.getModels().length==0) {
		monaco.editor.createModel(libSource, "typescript", monaco.Uri.parse(libUri));
	}
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
	const monacoRef = useRef<Monaco|undefined>(undefined);
	const editorRef = useRef<any|undefined>(undefined);

	const handleEditorChange: OnChange = (value: string|undefined, event: any) => {
		console.log("EditorChange",value, event)
	}

	const handleEditorWillMount= (monaco: Monaco) => {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
		monacoSetup(monaco)
  }

	const addWidget= () => {
		const widget: {domNode: undefined|any, getId: any, getDomNode: any, getPosition: any} = { //XXX:find proper types!
			domNode: undefined,
			getId: function() {
				console.log("getId")
				// Generate a unique ID for the widget
				return 'my-inline-widget';
			},
			getDomNode: function() {
				// Create and return the widget's DOM node
				if (!this.domNode) {
					this.domNode = document.createElement('div');
					if (this.domNode!= null) {
						this.domNode.className = 'inline-widget';
						this.domNode.textContent = 'My Inline Widget';
						this.domNode.style.cssText = `
						display: inline-block;
						margin-left: 10px;
						width: 50px;
						height: 50px;
						font-size: 12px;
						line-height: 20px;
						overflow: hidden;
						background: yellow;
						padding: 5px;
						`;
					}
					console.log("getDomNode", this.domNode)
				}
				return this.domNode;
			},
			getPosition: function() {
				// Return the position where the widget should be inserted
				return {
					position: {
						lineNumber: 6, // Line number where the widget should be inserted
						column: 10 // Column number where the widget should be inserted
					},
					preference: [monacoRef.current?.editor.ContentWidgetPositionPreference.BELOW] // Position preference
				};
			}
		};

		editorRef.current?.addContentWidget(widget);
		editorRef.current?.layout();
	}

	const handleEditorDidMount: OnMount = (editor: any, monaco: Monaco) => {
    monacoRef.current = monaco;
		editorRef.current = editor;

		//SEE: https://microsoft.github.io/monaco-editor/playground.html?source=v0.45.0#example-interacting-with-the-editor-adding-an-action-to-an-editor-instance
		editor.addAction({
			id: "mi_accion",
			label: "MI ACCION!",
			keybindings: [
				monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
				monaco.KeyMod.chord( //A: Secuencia, primero ctrl+k, despues ctrl+m
					monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
					monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM
				),
			],
			contextMenuGroupId: "navigation",
			contextMenuOrder: 1.5,
			precondition: null,
			run: (ed: any) => { //XXX: get monaco types eg IEditor
				alert("i'm running => " + ed.getPosition());
			},
		});

		addWidget();
  } 


  return (
    <Editor
      height="80vh"
      defaultValue={someJsCode}
      defaultLanguage="javascript"
			theme="vs-dark"
			options={{ cursorStyle:"block" }}
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
			onChange={handleEditorChange}
    />
  );
}

