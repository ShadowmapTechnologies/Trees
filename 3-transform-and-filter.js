#!/usr/bin/env node --max-old-space-size=8192

import chalk from "chalk";
import { createReadStream, existsSync, mkdirSync, createWriteStream } from "fs";
import { sources } from "./sources.js";
import ndjson from "ndjson";

// sane maximum values
const MAXIMUM_CIRCUMFERENCE = 10;
const MAXIMUM_HEIGHT = 50;
const MAXIMUM_DIAMETER_CROWN = 50;

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
  var originalFields = tree.properties;

  tree = {
    type: "Feature",
    geometry: tree.geometry,
    properties: {},
  };

  transformation = { ...fieldsIdentity, ...transformation };

  for (const prop of Object.keys(transformation)) {
    const val =
      typeof transformation[prop] === "function"
        ? transformation[prop](originalFields)
        : originalFields[transformation[prop]];
    tree.properties[prop] = val;
  }

  return filter(tree);
}

function filter(tree) {
  const { circumference, height, diameter_crown } = tree.properties;
  if (
    !circumference ||
    circumference <= 0 ||
    MAXIMUM_CIRCUMFERENCE <= circumference
  ) {
    return undefined;
  }

  if (!height || height <= 0 || MAXIMUM_HEIGHT <= height) {
    return undefined;
  }

  if (
    !diameter_crown ||
    diameter_crown <= 0 ||
    MAXIMUM_DIAMETER_CROWN <= diameter_crown
  ) {
    return undefined;
  }

  return tree;
}

function transform(source, destination, fieldTransformations) {
  let removed = 0,
    kept = 0;
  const destinationStream = createWriteStream(destination).on(
    "error",
    console.error
  );

  return new Promise((resolve, reject) => {
    createReadStream(source)
      .pipe(ndjson.parse())
      .on("data", function (tree) {
        const transformedTree = crosswalk(tree, fieldTransformations);

        if (transformedTree === undefined) {
          removed++;
          return;
        }

        kept++;
        destinationStream.write(JSON.stringify(transformedTree) + "\n");
      })
      .on("error", (error) => {
        console.error(
          chalk.red(`Error while processing file ${source}`),
          error
        );
        reject();
      })
      .on("end", () => {
        console.log(
          chalk.green(
            `Successfully processed file ${source}. Total processed ${
              kept + removed
            } trees, ${removed} removed.`
          )
        );
        resolve();
      });
  });
}

async function execute() {
  await Promise.all(
    sources.map(async ({ name, fieldTransformations }) => {
      const source = `2/${name}.geojson`;
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
