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
    sources.map(async ({ name, extension, url }) => {
      const filePath = `1/${name}.${extension}`;

      if (existsSync(filePath)) {
        skipCount++;
        console.log(
          chalk.yellow(
            `Skipping ${name} because it exists already at ${filePath}`
          )
        );
        return;
      }
      console.log(chalk.blue(`Downloading ${name} from ${url}`));

      try {
        const data = await download(url);

        writeFileSync(filePath, data);
        console.log(chalk.green(`Downloaded ${name}`));

        if (extension === "zip") {
          try {
            execSync(`unzip -d ${process.cwd()}/1/unzip/ "1/${name}"`, {
              stdio: "inherit",
            });
            console.log(chalk.green(`Unzipped ${name} to ${filePath}`));
          } catch (err) {
            console.error(chalk.red(`Error unzipping ${name}:`, err));
          }
        } else {
          execSync(
            `cp "${process.cwd()}/${filePath}" ${process.cwd()}/1/unzip/ `
          );
        }
      } catch (error) {
        console.error(chalk.red(`Error while processing ${name}: `), error);
        execSync(`mv "1/${name}" "1/${name}.bad"`);
        // remove the partially downloaded file?
      }
    })
  );
}

execute();
