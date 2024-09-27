# gutenberg-tools

A collection of scripts used to make the [gutenberg2-dpo](https://huggingface.co/datasets/nbeerbower/gutenberg2-dpo) dataset.

## Script Order

1. `deliner.js` - Removes line breaks from the text in the chosen column.
2. `summarizer.js` - Summarizes each chapter using an LLM.
3. `prompter.js` - Generates prompts for each chapter.
4. `rejecter.js` - Uses prompts to generate rejected responses.

## TODO

* Configuration file for all scripts.
* Code comments.
* Script(s) to parse and clean chapters from Project Gutenberg text files. For now this is done manually with [chapterize](https://github.com/JonathanReeve/chapterize) output.
* A single entrypoint script to run all of the above in order.
* An agent capable of automatically scraping Project Gutenberg for new books and running the above scripts on them.