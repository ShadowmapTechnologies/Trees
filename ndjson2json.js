import { readFileSync, writeFileSync } from "fs";

const file = process.argv[2];

const content = readFileSync(file).toString().split("\n"); // read file and convert to array by line break
content.shift(); // first line is a comma => remove it
content.pop(); // last line is a new line => remove it
const contentAsString = content.join(","); // convert array back to string with commas

writeFileSync(`${file}.json`, `[${contentAsString}]`);
