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

function getSentences(text: string) {
  const result = [];
  let currentSentence = '';
  for (let i = 0; i < text.length; i++) {
    currentSentence += text[i];

    if (i + 3 < text.length && text[i+1] === '.' && text[i+2] === '.' && text[i+3] === '.') {
      if (currentSentence.trim() !== "") {
        result.push(currentSentence.trim() + '...');
      }
      currentSentence = '';
      i += 3;
    } else if (i + 1 < text.length && (text[i+1] === '.' || text[i+1] === '?' || text[i+1] === '!')) {
      if (currentSentence.trim() !== "") {
        result.push(currentSentence.trim() + text[i+1]);
      }
      currentSentence = '';
      i++;
    }
  }
  if (currentSentence.trim() !== "") {
    result.push(currentSentence);
  }
  return result;
}

function getCounts(paragraphs: string[]) {
  const result = {
    paragraphs: paragraphs.length,
    sentences: 0,
    words: 0,
    characters: 0
  };
  for (const paragraph of paragraphs) {
    const sentences = getSentences(paragraph);
    result.sentences += sentences.length;
    for (const sentence of sentences) {
      const words = sentence.split(/\s/)
      result.words += words.length;
      for (const word of words) {
        result.characters += word.length;
      }
    }
  }
  return result;
}

document.addEventListener('trix-initialize', function (event) {
  const trix: any = document.getElementById('trix-editor');

  const debouncedCalc = debounce(() => {
    const calcEl = document.getElementById('calc-container');
    if (calcEl) {
      const counts = getCounts(new TagTide(trix.value).blocksToText());
      calcEl.innerHTML = `
      Paragraphs: ${counts.paragraphs}<br>
      Sentences: ${counts.sentences}<br>
      Words: ${counts.words}<br>
      Characters: ${counts.characters}
      `;
      console.log(counts);
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
