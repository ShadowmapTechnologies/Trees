#!/usr/bin/env node --max-old-space-size=8192

import chalk from "chalk";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  appendFileSync,
  readFileSync,
} from "fs";
import { sources } from "./sources.js";
import ndjson from "ndjson";

const dist = "./dist";
const zoom = "14";
const extension = ".json.ico";

// DELETE DIST IF EXISTS
if (existsSync(dist)) {
  try {
    rmSync(dist, { recursive: true });

    console.log(chalk.blue(`Deleted folder ${dist}`));
  } catch (err) {
    console.error(chalk.red(`Error while deleting ${dist}.`));
  }
}

[dist, `${dist}/${zoom}`].forEach((dir) => {
  if (!existsSync(dir)) {
    console.log(chalk.blue(`Create folder ${dir}`));
    mkdirSync(dir);
  }
});

function checkIfSourceExists(name, source) {
  if (!existsSync(source)) {
    console.log(
      chalk.yellow(`Skipping ${name} because no source file at ${source}`)
    );
    return false;
  }
  return true;
}

function getTileIndexForLocation(lat, lng) {
  const lat_rad = (lat * Math.PI) / 180.0;

  const n = Math.pow(2, zoom);
  const x = Math.trunc(n * ((lng + 180.0) / 360.0));
  const y = Math.trunc(
    (n * (1 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI)) /
      2
  );

  return { zoom, x, y };
}

function getFilename(lat, lng) {
  const index = getTileIndexForLocation(lat, lng);

  return `dist/${index.zoom}/${index.x}/${index.y}${extension}`;
}

function createXFoldersAndYFiles(area) {
  const [[topLeftX, topLeftY], [bottomRightX, bottomRightY]] = area;
  for (let i = topLeftX; i <= bottomRightX; i++) {
    mkdirSync(`${dist}/${zoom}/${i}`);
    for (let j = topLeftY; j <= bottomRightY; j++) {
      writeFileSync(`${dist}/${zoom}/${i}/${j}${extension}`, "");
    }
  }
}

function makeValidJSONs(area) {
  const [[topLeftX, topLeftY], [bottomRightX, bottomRightY]] = area;

  // MAKE TILE FILES VALID JSONs
  for (let i = topLeftX; i <= bottomRightX; i++) {
    for (let j = topLeftY; j <= bottomRightY; j++) {
      let content = readFileSync(`${dist}/${zoom}/${i}/${j}${extension}`)
        .toString()
        .split("\n"); // read file and convert to array by line break

      content.shift(); // first line is a comma => remove it
      content.pop(); // last line is a new line => remove it
      const contentAsString = content.join(","); // convert array back to string with commas

      writeFileSync(
        `${dist}/${zoom}/${i}/${j}${extension}`,
        `[${contentAsString}]`
      );
    }
  }
}

let skipCount = 0;

function copy(source) {
  return new Promise((resolve, reject) => {
    createReadStream(source)
      .pipe(ndjson.parse())
      .on("data", function (tree) {
        const file = getFilename(
          tree.geometry.coordinates[1],
          tree.geometry.coordinates[0]
        );

        if (!tree?.geometry?.coordinates) {
          console.log(
            chalk.yellow(`Skipped tree because it has no coordinates`)
          );
          return;
        }
        appendFileSync(file, `${JSON.stringify(tree)}\n`);
      })
      .on("error", (error) => {
        console.error(
          chalk.red(`Error while processing file ${source}`),
          error
        );
        reject();
      })
      .on("end", function () {
        resolve();
      });
  });
}

async function execute() {
  await Promise.all(
    sources.map(async ({ name, area }) => {
      createXFoldersAndYFiles(area);

      const source = `3/${name}.geojson`;

      if (!checkIfSourceExists(name, source)) {
        skipCount++;
        return;
      }

      console.log(
        chalk.blue(`Copying trees of ${name} to corresponding tiles`)
      );
      await copy(source);
      console.log(
        chalk.green(`Copied all trees of ${name} to corresponding tiles`)
      );

      console.log(chalk.blue(`Making valid JSON files for area ${name}`));
      makeValidJSONs(area);
      console.log(chalk.green(`Made valid JSON files for area ${name}`));
    })
  );
  console.log(
    chalk.green(`Finished copying all trees. Skipped ${skipCount} sources.`)
  );
}

execute();
