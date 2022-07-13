#!/usr/bin/env node --max-old-space-size=8192

import { existsSync, mkdirSync, writeFileSync } from "fs";
import download from "download";
import { sources } from "./sources.js";
import { execSync } from "child_process";
import chalk from "chalk";

["./1", "./1/unzip"].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
});

async function execute() {
  let skipCount = 0;

  await Promise.all(
    sources.map(async (source) => {
      const filename = `${source.name}`;
      const filePath = `1/${filename}.${source.extension}`;

      if (existsSync(filePath)) {
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

        if (source.extension === "zip") {
          try {
            execSync(`unzip -d ${process.cwd()}/1/unzip/ "1/${source.name}"`, {
              stdio: "inherit",
            });
            console.log(chalk.green(`Unzipped ${filename} to ${filePath}`));
          } catch (err) {
            console.error(chalk.red(`Error unzipping ${filename}:`, err));
          }
        } else {
          execSync(
            `cp "${process.cwd()}/${filePath}" ${process.cwd()}/1/unzip/ `
          );
        }
      } catch (error) {
        console.error(chalk.red(`Error while processing ${filename}: `), error);
        execSync(`mv "1/${filename}" "1/${filename}.bad"`);
        // remove the partially downloaded file?
      }
    })
  );
}

execute();
