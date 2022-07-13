#!/usr/bin/env node --max-old-space-size=8192

import chalk from "chalk";
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { sources } from "./sources.js";

["./2"].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
});

function check(name, source, destination) {
  if (existsSync(destination)) {
    console.log(
      chalk.yellow(
        `Skipping ${name} because it exists already at ${destination}`
      )
    );
    return false;
  }

  if (!existsSync(source)) {
    console.log(
      chalk.yellow(`Skipping ${name} because no source file at ${source}`)
    );
    return false;
  }
  return true;
}

let skipCount = 0;

async function execute() {
  await Promise.all(
    sources.map(async ({ name }) => {
      const source = `1/unzip/${name}.csv`;
      const destination = `2/${name}.geojson`;

      try {
        if (!check(name, source, destination)) {
          skipCount++;
          return;
        }

        const options = `-s_srs EPSG:4326 -oo GEOM_POSSIBLE_NAMES="SHAPE" -oo Y_POSSIBLE_NAMES="Latitude" -oo X_POSSIBLE_NAMES="Longitude"`;

        console.log(chalk.blue(`Converting ${name}`));
        let cmd = `ogr2ogr -t_srs EPSG:4326 -gt 65536 ${options} -f GeoJSONSeq ${process.cwd()}/${destination} "${process.cwd()}/${source}"`;
        console.log(cmd);
        execSync(cmd);

        console.log(chalk.green(`Loaded ${source.filename}`));
        console.log(chalk.blue("Checking for null or bad geometry"));
        cmd = `head ${destination} | ndjson-filter '!d.geometry || d.geometry.coordinates[0] < -180 || d.geometry.coordinates[0] > 180 || d.geometry.coordinates[1] < -80 || d.geometry.coordinates[1] > 80' 1>&2`;
        console.log(cmd);
        execSync(cmd);
      } catch (error) {
        console.error(chalk.red(`Error processing ${source.filename}`), error);
      }
    })
  );
}

execute();

console.log(`Finished transforming trees. Skip count ${skipCount}.`);
