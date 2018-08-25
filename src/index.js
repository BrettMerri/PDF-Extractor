const fs = require('fs');
const pdf = require('pdf-parse');

// default render callback
const render_page = (pageData, ret) => {
  //check documents https://mozilla.github.io/pdf.js/
  ret.textByPage = ret.textByPage || {};

  const render_options = {
    //replaces all occurrences of whitespace with standard spaces (0x20).
    normalizeWhitespace: true,
    //do not attempt to combine same line TextItem's.
    disableCombineTextItems: false
  }

  console.log('pageData', pageData.pageIndex)

  return pageData.getTextContent(render_options).then(textContent => {
    const strings = textContent.items.map(item => item.str);
    const text = strings.join(' ');
    const pageNumber = Number(pageData.pageIndex);
    // ret.text = `${ret.text} ${text}`;
    ret.textByPage = {
      ...ret.textByPage,
      [pageNumber]: text
    };
  });
}

const options = {
  pagerender: render_page
}

const dataBuffer = fs.readFileSync('./in/test.pdf');

pdf(dataBuffer, options).then(data => {
  console.log(data.textByPage);
  // console.log(data);
}).catch(error => {
  console.log(error);
})
