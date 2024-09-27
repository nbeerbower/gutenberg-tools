import OpenAI from 'openai';

const URL = 'http://127.0.0.1:5001/v1';

const openai = new OpenAI({ 
	baseURL: URL,
	apiKey: ''
});

import fs from 'fs';
const text = fs.readFileSync('prompts2.json', 'utf8');
const json = JSON.parse(text);

const n = json.length;
console.log(`Loaded ${n} chapters of text.`);
for (let i = 0; i < n; i++) {
	console.log(`* Processing chapter ${i + 1} of ${n}...`);
	const entry = json[i];
	const prompt = entry.prompt;
	let input = prompt;
	const systemPrompt = `Given the following prompt, write a chapter of a novel. Do not mention the title of the book or the author in your response. Write as if you are continuing a story. Do not include the prompt or any other headings or instructions in your response.`;
	let success = false;
	//let temperature = 0.1;
	while (!success) {
		try {
			const request = await openai.chat.completions.create({
				messages: [
					{ role: 'system', content: systemPrompt }, 
					{ role: 'user', content: input }
				],
				//max_completion_tokens: 8196,
				//temperature,
			});
			const output = request.choices[0].message.content;
			console.log(output);
			console.log(`- Generated ${request.usage.total_tokens} tokens.`);
			json[i].rejected = output;
			success = true;
		} catch (error) {
			console.error('! Error encountered... retrying...');
		}
	}
}
fs.writeFileSync('final.json', JSON.stringify(json, null, 2));