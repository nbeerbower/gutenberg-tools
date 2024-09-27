import OpenAI from 'openai';

const URL = 'http://127.0.0.1:5001/v1';

const BANNED_OUTPUT = [
	'in this passage', 
	'in conclusion', 
	'overall,', 
	'this chapter',
	'this text',
	'this passage',
	'this excerpt',
	'this section',
	'this selection',
	'this story',
	'the story',
	'this novel',
	'this book',
	'this extract',
	'" by ',
	'<|endoftext|>',
	'<|im_start|>',
	'<|im_end|>',
	'###',
	'1.',
	'0:',
	'1:',
];

const openai = new OpenAI({ 
	baseURL: URL,
	apiKey: ''
});

import fs from 'fs';
const text = fs.readFileSync('./output.json', 'utf8');
const json = JSON.parse(text);

const n = json.length;
console.log(`Loaded ${n} chapters of text.`);
for (let i = 0; i < n; i++) {
	console.log(`* Processing chapter ${i + 1} of ${n}...`);
	const entry = json[i];
	const book = entry.book;
	const chapter = entry.chosen;
	const systemPrompt = `Read and then summarize the chapter of a novel provided by the user. Be descriptive, avoid essay language like "Overall," "In conclusion," "In this passage," etc. Simply summarize the plot and key points of the provided text. Do not talk about the book nor mention the title of the book or the author in your summary. Write only your summary in a single paragraph and no other text, headings, or lists.`;
	let success = false;
	while (!success) {
		try {
			const summary = await openai.chat.completions.create({
				messages: [
					{ role: 'system', content: systemPrompt }, 
					{ role: 'user', content: chapter }
				],
			});
			const output = summary.choices[0].message.content;
			// Check for common errors in the output
			const testText = output.toLowerCase();
			const hasBannedOutput = BANNED_OUTPUT.some((banned) => testText.includes(banned));
			if (hasBannedOutput || testText.includes(`"${book}"`)) {
				console.warn('! Banned output detected...');
				throw new Error('Writing error detected in output.');
			}
			json[i].summary = output;
			console.log(output);
			console.log(`- Generated ${summary.usage.total_tokens} tokens.`);
			success = true;
		} catch (error) {
			console.error('! Error encountered... retrying...');
		}
	}
}
fs.writeFileSync('summaries.json', JSON.stringify(json, null, 2));