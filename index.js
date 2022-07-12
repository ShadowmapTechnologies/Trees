const fs = require("fs");

const dist = "./dist/";
const sourceFile = "vienna-trees.json";
const zoom = 14;
const extension = ".json.ico";
// A rectangle containing Vienna and its trees
const topLeftX = 8922;
const topLeftY = 5672;
const bottomRightX = 8955;
const bottomRightY = 5700;

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

function mapTree(tree) {
  // https://wiki.openstreetmap.org/wiki/Tag:natural=tree

  const id = tree.properties.BAUM_ID;
  const coordinates = tree.geometry.coordinates;
  // STAMMUMFANG / 100.0 = circumference in meters
  const circumference = Math.round(tree.properties.STAMMUMFANG * 10) / 1000;
  // HÖHE * 5 - 2.5 = height in meters
  const height = tree.properties.BAUMHOEHE * 5 - 2.5;
  // KRONENDURCHMESSER * 3 - 1.5 = diameter crown in meters
  const diameter_crown = tree.properties.KRONENDURCHMESSER * 3 - 1.5;

  if (circumference > 50) {
    console.warn(
      `tree ${tree.properties.BAUM_ID} has a circumference over 50 meters [${circumference}]. Skipping...`
    );
    return undefined;
  }

  return {
    id,
    coordinates,
    circumference,
    height,
    diameter_crown,
  };
}

// DELETE DIST IF EXISTS
if (fs.existsSync(dist)) {
  try {
    fs.rmSync(dist, { recursive: true });

    console.log(`Deleted folder ${dist}`);
  } catch (err) {
    console.error(`Error while deleting ${dist}.`);
  }
}

// CREATE DIST FOLDER
fs.mkdirSync(dist);
console.log(`Create empty folder ${dist}`);
// CREATE ZOOM FOLDER
fs.mkdirSync(`${dist}/${zoom}`);
console.log(`Create tile folder for ${zoom}`);
// CREATE X FOLDER Y FILES
for (let i = topLeftX; i <= bottomRightX; i++) {
  console.log(`Create tile folder for ${zoom}/${i}`);
  fs.mkdirSync(`${dist}/${zoom}/${i}`);
  for (let j = topLeftY; j <= bottomRightY; j++) {
    console.log(`Create tile file ${zoom}/${i}/${j}${extension}`);
    fs.writeFileSync(`${dist}/${zoom}/${i}/${j}${extension}`, "");
  }
}

// READ AND PARSE FILE
const unparsedData = fs.readFileSync(sourceFile, "utf8");
console.log(`Read file ${sourceFile}`);

const data = JSON.parse(unparsedData);
console.log(
  `Parsed ${data.length} trees. Split them into respective tile files...`
);

// SAVE TREE PER TREE
for (let i = 0; i < data.length; i++) {
  const tree = data[i];

  const file = getFilename(
    tree.geometry.coordinates[1],
    tree.geometry.coordinates[0]
  );

  if (!tree?.geometry?.coordinates) {
    console.log(`Skipped tree ${tree.id} because it has no coordinates`);
    continue;
  }

  const mappedTree = mapTree(tree);

  if (mappedTree === undefined) {
    continue;
  }

  fs.appendFileSync(file, `,\n${JSON.stringify(mappedTree)}\n`);
  console.log(
    `${i}/${data.length} - ${Math.round(
      (i / data.length) * 100
    )}% - appended tree ${tree.id} to ${file}`
  );
}
console.log(`Saved ${data.length} trees in their respective tile files.`);

// MAKE TILE FILES VALID JSONs
for (let i = topLeftX; i <= bottomRightX; i++) {
  for (let j = topLeftY; j <= bottomRightY; j++) {
    console.log(
      `Convert tile file ${dist}/${zoom}/${i}/${j}${extension} to valid JSON.`
    );
    let content = fs
      .readFileSync(`${dist}/${zoom}/${i}/${j}${extension}`)
      .toString()
      .split("\n"); // read file and convert to array by line break

    content.shift(); // first line is a comma => remove it
    content.pop(); // last line is a new line => remove it
    content.unshift("["); // add opening [
    content.push("]"); // add closing [
    content = content.join("\n"); // convert array back to string

    fs.writeFileSync(`${dist}/${zoom}/${i}/${j}${extension}`, content);
  }
}

console.log(`Finished!`);
