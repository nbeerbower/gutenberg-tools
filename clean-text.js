const fs = require('fs');

function cleanGutenbergText(text) {
  // Handle THE END and remove everything after
  let endText = '';
  if (text.includes('THE END')) {
    text = text.split('THE END')[0].trim() + '\n\nTHE END';
  }

  // Character replacement map
  const charMap = {
    '\u201C': '"', // left double quotation mark
    '\u201D': '"', // right double quotation mark
    '\u2033': '"', // double prime
    '\u2018': "'", // left single quotation mark
    '\u2019': "'", // right single quotation mark
    '\u2032': "'", // prime
    '\u0060': "'", // backtick
    '\u201A': ",", // single low-9 quotation mark
    '\u2014': '--', // em-dash
    '\u2013': '--', // en-dash
    '\u2015': '--', // horizontal bar
    '\u2012': '--', // figure dash
  };

  const charPattern = new RegExp(`[${Object.keys(charMap).join('')}]`, 'g');

  return text
    // Replace special characters
    .replace(charPattern, match => charMap[match])
    
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    
    // Remove asterisk separator lines
    .replace(/^\s*\*\s*\*\s*\*\s*\*\s*\*\s*$/gm, '')
    
    // Remove illustration tags and bracketed content
    .replace(/\[.*?\]/g, '')
    
    // Remove decorative separator lines
    .replace(/^[\s*_-]{3,}$/gm, '')
    
    // Keep quotes with their text while cleaning up spaces
    .replace(/"([^"]+)"/g, (match, p1) => `"${p1.trim()}"`)
    
    // Split into paragraphs, clean each paragraph
    .split('\n\n')
    .map(paragraph => {
      // Clean up spaces within paragraph while preserving quote placement
      return paragraph
        .split('\n')
        .map(line => line.trim())
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    })
    .filter(para => para.length > 0)
    .join('\n\n')
    
    // Add dialog breaks (new paragraph after dialog) but keep quotes with text
    .replace(/([.!?]")(\s*)([A-Z])/g, '$1\n\n$3')
    
    // Final cleanup
    .replace(/[ \t]+/g, ' ')
    .trim();
}

// Check if input and output filenames were provided
if (process.argv.length !== 4) {
    console.log('Usage: node clean-text.js input.json output.json');
    process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

try {
    // Read and parse input JSON
    const text = fs.readFileSync(inputFile, 'utf8');
    const json = JSON.parse(text);
    
    console.log(`Processing ${json.length} rows...`);
    
    // Clean the text in the chosen field of each row
    json.forEach((row) => {
        row.chosen = cleanGutenbergText(row.chosen);
        delete row.rejected;
        delete row.prompt;
    });
    
    // Write output JSON
    fs.writeFileSync(outputFile, JSON.stringify(json, null, 2));
    
    console.log(`Successfully cleaned text and saved to ${outputFile}`);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}