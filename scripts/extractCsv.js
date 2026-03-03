const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const xlsxPath = path.join(__dirname, '../genesis_one_ipsc_dataset.xlsx');
const csvPath = path.join(__dirname, '../genesis_one_ipsc_dataset.xlsx - Colony Tracking Data.csv');

try {
    const workbook = xlsx.readFile(xlsxPath);

    // Assume the sheet we want is 'Colony Tracking Data' or the first one if it doesn't exist
    let sheetName = 'Colony Tracking Data';
    if (!workbook.Sheets[sheetName]) {
        sheetName = workbook.SheetNames[0];
        console.log(`Sheet 'Colony Tracking Data' not found, defaulting to: ${sheetName}`);
    }

    const sheet = workbook.Sheets[sheetName];
    const csvData = xlsx.utils.sheet_to_csv(sheet);

    fs.writeFileSync(csvPath, csvData);
    console.log('Successfully extracted CSV to:', csvPath);
} catch (error) {
    console.error('Error extracting CSV:', error);
}
