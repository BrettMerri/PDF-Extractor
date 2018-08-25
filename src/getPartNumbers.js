const fs = require('fs');
const csv = require('csv-parser')

const getPartNumbers = cb => {
  return new Promise((resolve, reject) => {
    const csvStream = csv(['partnumber']);
    const partNumbers = [];
    fs.createReadStream('./in/partnumbers.csv')
      .pipe(csvStream)
      .on('data', data => {
        partNumbers.push(data.partnumber)
      })
      .on('end', () => {
        console.log(`using part numbers: ${partNumbers}`);
        resolve(partNumbers);
      })
      .on('error', err => {
        reject(err);
      })
  });
}

module.exports = getPartNumbers;
