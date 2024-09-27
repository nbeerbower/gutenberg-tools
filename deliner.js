function convertLineBreaksToSpaces(text) {
  // Replace line breaks that are not part of paragraph breaks
  return text.replace(/(?<!\n)\n(?!\n)/g, ' ')
    // Remove any extra spaces that might have been created
    .replace(/\s+/g, ' ')
    // Trim leading and trailing whitespace
    .trim();
}

// load the text from the file
const fs = require('fs');
const text = fs.readFileSync('./input.json', 'utf8');
const json = JSON.parse(text);

// fix chosen column linebreaks
json.forEach((row) => {
	row.chosen = convertLineBreaksToSpaces(row.chosen);
	delete row.rejected;
	delete row.prompt;
});

// save the fixed text to a new file
fs.writeFileSync('output.json', JSON.stringify(json, null, 2));