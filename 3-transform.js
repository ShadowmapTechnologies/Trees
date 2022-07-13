#!/usr/bin/env node --max-old-space-size=8192

import chalk from "chalk";
import { createReadStream, existsSync, mkdirSync, createWriteStream } from "fs";
import { sources } from "./sources.js";
import ndjson from "ndjson";

["./3"].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
});

let skipCount = 0;

const fieldsIdentity = {
  circumference: "circumference", // in meters
  height: "height", // in meters
  diameter_crown: "diameter_crown", // in meters
};

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

function crosswalk(tree, transformation) {
  // if they are already correct we use an identity function, otherwise a transformation needs to be provided
  transformation = { ...fieldsIdentity, ...transformation };
  var originalFields = tree.properties;

  tree = {
    type: "Feature",
    geometry: tree.geometry,
    properties: {},
  };

  for (const prop of Object.keys(transformation)) {
    const val =
      typeof transformation[prop] === "function"
        ? transformation[prop](originalFields)
        : originalFields[transformation[prop]];
    if (val !== undefined) {
      tree.properties[prop] = val;
    }
  }
  return tree;
}

function transform(source, destination, fieldTransformations) {
  const destinationStream = createWriteStream(destination).on(
    "error",
    console.error
  );

  return new Promise((resolve, reject) => {
    createReadStream(source)
      .pipe(ndjson.parse())
      .on("data", function (tree) {
        const transformedTree = crosswalk(tree, fieldTransformations);

        destinationStream.write(JSON.stringify(transformedTree) + "\n");
      })
      .on("error", (error) => {
        console.error(
          chalk.red(`Error while processing file ${source}`),
          error
        );
        reject();
      })
      .on("end", function () {
        console.log(chalk.green(`Successfully processed file ${source}`));
        resolve();
      });
  });
}

async function execute() {
  await Promise.all(
    sources.map(async ({ name, fieldTransformations }) => {
      const source = `data/geojson/${name}.geojson`;
      const destination = `3/${name}.geojson`;

      if (!check(name, source, destination)) {
        skipCount++;
        return;
      }

      console.log(chalk.blue(`Transforming ${name}`));
      return transform(source, destination, fieldTransformations);
    })
  );
  console.log(
    chalk.blue(`Finished transforming trees. Skip count ${skipCount}.`)
  );
}

execute();
