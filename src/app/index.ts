// @ts-ignore
import Trix from 'trix';
import { TagTide } from "tag-tide";

function debounce(func: Function, timeout = 300) {
  let timer: any;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // @ts-ignore
      func.apply(this, args);
    }, timeout);
  };
}

function calc() {
  console.log(editor.value);
}

const debouncedCalc = debounce(calc, 400);

let editor: any;

document.addEventListener('trix-initialize', function (event) {
  Trix.config.blockAttributes.default.tagName = 'p';

  editor = document.querySelector('trix-editor');

  editor.addEventListener('trix-paste', (e: any) => {
    const prettified = new TagTide(e.paste.html)
      .startAfter("id", /^docs-internal-guid-.+/)
      .textTable()
      .flatten(["a", "img", "li"])
      .removeAttributes({ a: ["href", "_target"], img: ["src", "alt"] })
      .rootParagraphs()
      .result();

    editor.editor.undo();
    editor.editor.insertHTML(prettified);
  });

  editor.addEventListener('trix-change', (e: any) => {
    debouncedCalc();
  });
});
