import OpenAI from 'openai';

const URL = 'http://127.0.0.1:5001/v1';

const openai = new OpenAI({ 
	baseURL: URL,
	apiKey: ''
});

import fs from 'fs';
const text = fs.readFileSync('summaries.json', 'utf8');
const json = JSON.parse(text);

const n = json.length;
console.log(`Loaded ${n} chapters of text.`);
for (let i = 0; i < n; i++) {
	console.log(`* Processing chapter ${i + 1} of ${n}...`);
	const entry = json[i];
	const book = entry.book;
	const chapter = entry.chosen.trim();
	const chapIdx = entry.chapter;
	const isFirst = chapIdx == 1;
	let input = chapter;
	if (!isFirst) {
		const summary = json[i - 1].summary.trim();
		input = `Summary of previous chapter:\n${summary}\n\nNext chapter:\n${chapter}`;
	}
	const systemOpener = isFirst ?
		`Read the opening chapter of ${book} provided by the user.` :
		`Read the chapter and summary of the previous chapter of ${book} provided by the user.`;
	const systemCloser = isFirst ?
		'Start your response with "Write the opening chapter of a novel "' :
		'Start your response with "Write the next chapter of a novel ". ';
	const systemPrompt = `${systemOpener} Then write a prompt for an LLM that would result in this chapter being written. Be descriptive, ask for specific details, and do not mention the title of the book or the author in the prompt. ${systemCloser}`;
	let success = false;
	//let temperature = 0.1;
	while (!success) {
		try {
			const request = await openai.chat.completions.create({
				messages: [
					{ role: 'system', content: systemPrompt }, 
					{ role: 'user', content: input }
				],
				//temperature,
			});
			const output = request.choices[0].message.content;
			const testText = output.toLowerCase();
			if (!testText.startsWith('write')) {
				console.warn('! Output does not start with "Write"');
				//temperature += 0.1;
				input += '\n Respond with a prompt that starts with "Write a chapter of a novel ".';
				throw new Error('Invalid output');
			}
			console.log(output);
			console.log(`- Generated ${request.usage.total_tokens} tokens.`);
			const summaryPrompt = isFirst ? '' : `Summary of the previous chapter: ${json[i - 1].summary}\n\n`;
			json[i].prompt = `${summaryPrompt}${output}`;
			success = true;
		} catch (error) {
			console.error('! Error encountered... retrying...');
		}
	}
}
fs.writeFileSync('prompts.json', JSON.stringify(json, null, 2));