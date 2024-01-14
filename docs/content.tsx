/**
  
## Text/Rich

We can use Quill

 * Suggested as PrimeReact [Editor](https://primereact.org/editor/)
 * Use events and [formatText](https://quilljs.com/docs/api/#formattext) 
    * to add bold, etc. as you type _alla_ Markdown on mobile
		* for math 
 * There is a [syntax highlighter](https://quilljs.com/docs/modules/syntax/)

There is a [format](https://quilljs.com/docs/formats/#embeds) concept to extend the editor
 * math already exists!
 * embed video too, just pasting a youtube url works

Another way to add new content types is shown [here](https://quilljs.com/docs/formats/#embeds)

It's especially suitable as the document is expressed as "changesets" aka [Deltas](https://quilljs.com/docs/delta/)

[Change events](https://primereact.org/editor/#api.Editor.events) also emit deltas

@module
*/
 
