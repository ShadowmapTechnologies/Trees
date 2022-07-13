#!/usr/bin/env node --max-old-space-size=8192

import chalk from "chalk";
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { sources } from "./sources.js";

["./data", "./data/geojson"].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
});

let skipCount = 0;

async function execute() {
  await Promise.all(
    sources.map(async (source) => {
      const filePath = `data/unzip/${source.filename}`;
      const destination = `data/geojson/${source.name}.geojson`;
      let options = "";

      try {
        if (existsSync(destination)) {
          console.log(
            chalk.yellow(
              `Skipping ${source.filename} because it exists already at ${destination}`
            )
          );
          skipCount++;
          return;
        }

        options += `-s_srs EPSG:4326 -oo Y_POSSIBLE_NAMES="Latitude" -oo X_POSSIBLE_NAMES="Longitude"`;

        console.log(chalk.blue(`Converting ${source.filename}`));
        let cmd = `ogr2ogr -t_srs EPSG:4326 -gt 65536 ${options} -f GeoJSONSeq ${process.cwd()}/${destination} ${
          source.gdal_options || source.gdalOptions || ""
        } "${process.cwd()}/${filePath}"`;
        console.log(cmd);
        execSync(cmd, { cwd: "data" });

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

console.log(`Finished transforming trees. Skip ount ${skipCount}.`);
