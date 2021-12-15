// @ts-ignore
import Trix from 'trix';
import { TagTide } from 'tag-tide';

Trix.config.blockAttributes.default.tagName = 'p';
Trix.config.textAttributes.foo = {
  style: { color: 'green', backgroundColor: 'yellow' },
  parser: function (element: any) {
    return element.style.color === 'green' && element.style.backgroundColor === 'yellow';
  },
  inheritable: true,
};
Trix.config.textAttributes.red = {
  style: { color: 'red' },
  parser: function (element: any) {
    return element.style.color === 'red';
  },
  inheritable: true,
};

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

function getCounts(paragraphs: string[]) {
  // words
  // characters
  // sentences
  //
}

document.addEventListener('trix-initialize', function (event) {
  const trix: any = document.getElementById('trix-editor');

  const debouncedCalc = debounce(() => {
    const calcEl = document.getElementById('calc-container');
    if (calcEl) {
      const paragraphs = new TagTide(trix.value).blocksToText();
      calcEl.innerHTML = `Paragraphs: ${paragraphs.length}`;
      getCounts(paragraphs);
    }
  }, 400);

  // toolbar events
  const dataFormats = document.querySelectorAll('[data-format]');

  function formatText(format: any) {
    const { editor } = trix;
    const { currentAttributes } = editor.composition;

    if (currentAttributes[format]) {
      editor.deactivateAttribute(format);
    } else {
      editor.activateAttribute(format);
    }
  }

  function handleMouseDown(e: any) {
    e.preventDefault();
    //@ts-ignore
    formatText(this.getAttribute('data-format'));
  }

  for (let i = dataFormats.length; i--; ) {
    dataFormats[i].addEventListener('mousedown', handleMouseDown);
  }
  // /toolbar events
  debouncedCalc();

  trix.editor.insertHTML(`<p>Hello world! Again and again... That's all.</p>`);
  trix.addEventListener('trix-paste', (e: any) => {
    const prettified = new TagTide(e.paste.html)
      .startAfter('id', /^docs-internal-guid-.+/)
      .textTable()
      .flatten(['p', 'a', 'img', 'li', 'h1', 'h2', 'h3', 'h4', 'h5'])
      .removeAttributes({ a: ['href', '_target'], img: ['src', 'alt'] })
      .rootParagraphs()
      .result(['meta', 'img']);

    console.log(e.paste.html);
    console.log(prettified);

    trix.editor.undo();
    trix.editor.insertHTML(prettified);
  });
  trix.addEventListener('trix-change', (e: any) => {
    debouncedCalc();
  });
});
