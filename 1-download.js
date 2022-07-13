#!/usr/bin/env node --max-old-space-size=8192

import { existsSync, mkdirSync, writeFileSync } from "fs";
import download from "download";
import { sources } from "./sources.js";
import { execSync } from "child_process";
import chalk from "chalk";

["./data", "./data/unzip"].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
});

async function execute() {
  let skipCount = 0;

  await Promise.all(
    sources.map(async (source) => {
      const filename = `${source.name}.zip`;
      const filePath = `data/${filename}`;

      if (existsSync(filename)) {
        skipCount++;
        console.log(
          chalk.yellow(
            `Skipping ${source.name} because it exists already at ${filePath}`
          )
        );
        return;
      }
      console.log(chalk.blue(`Downloading ${filename} from ${source.url}`));

      try {
        const data = await download(source.url);

        writeFileSync(filePath, data);
        console.log(chalk.green(`Downloaded ${filename}`));
        console.log(chalk.blue(`Unzipping ${filename}`));
        try {
          execSync(
            `unzip -d ${process.cwd()}/data/unzip/ "data/${source.name}"`,
            {
              stdio: "inherit",
            }
          );
          console.log(chalk.green(`Unzipped ${filename} to ${filePath}`));
        } catch (err) {
          console.error(chalk.red(`Error unzipping ${filename}:`, err));
        }
      } catch (error) {
        console.error(chalk.red(`Error while unzipping ${filename}: `), error);
        execSync(`mv "data/${filename}" "data/${filename}.bad"`);
        // remove the partially downloaded file?
      }
    })
  );
}

execute();
