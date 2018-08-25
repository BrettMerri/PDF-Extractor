const _ = require('lodash');
const fs = require('fs');
const pdf = require('pdf-parse');
const hummus = require('hummus');
const extractText = require('../lib/text-extraction');
const getPartNumbers = require('./getPartNumbers');
const Json2csvParser = require('json2csv').Parser;
const unixTime = Date.now();
const dirName = `./out/${unixTime}`;
if (!fs.existsSync(dirName)) {
  fs.mkdirSync(dirName);
  fs.mkdirSync(`${dirName}/pdfs`);
}

async function app() {
  console.log('starting app');
  const partNumberCollection = {};
  const addPartNumberToCollection = partNumber => {
    if (partNumberCollection[partNumber]) {
      partNumberCollection[partNumber] = [...partNumberCollection[partNumber], page]
    } else {
      partNumberCollection[partNumber] = [page];
    }
  }

  const partNumbers = await getPartNumbers();
  const pdfReader = hummus.createReader('./in/catalog.pdf');
  console.log('extracting pdf text...');
  const pdfTextPages = extractText(pdfReader);

  console.log('searching for part numbers in pdf');
  let page = 0;
  _.forEach(pdfTextPages, textPage => {
    _.forEach(partNumbers, partNumber => {
      _.forEach(textPage, textObj => {
        const re = new RegExp(`^${partNumber}$`, 'g');
        if (textObj.text.match(re)) {
          console.log(`found ${partNumber} on page ${page}`)
          addPartNumberToCollection(partNumber);
          return false
        }
      });
    });
    page++;
  });

  console.log('writing pdf pages');
  _.forEach(partNumberCollection, (pages, partNumber) => {
    const pdfWriter = hummus.createWriter(`${dirName}/pdfs/${partNumber}.pdf`);
    const pdfCopyingContext = pdfWriter.createPDFCopyingContext(pdfReader)
    _.forEach(pages, page => {
      pdfCopyingContext.appendPDFPageFromPDF(page);
    });
    pdfWriter.end();
  });

  const csvObject = [];
  _.forEach(partNumbers, partNumber => {
    if (partNumberCollection[partNumber]) {
      csvObject.push({
        partNumber: partNumber,
        pdf: `${partNumber}.pdf`,
      })
    } else {
      csvObject.push({
        partNumber: partNumber,
      })
    }
  })

  const json2csvParser = new Json2csvParser({ header: false, fields: ['partNumber', 'pdf'] });
  const csvContent = json2csvParser.parse(csvObject)

  console.log('writing csv');
  fs.writeFileSync(`${dirName}/partnumbers.csv`, csvContent);
}

app();
