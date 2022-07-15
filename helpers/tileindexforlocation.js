const lat = parseFloat(process.argv[2]);
const lng = parseFloat(process.argv[3]);

const zoom = "14";

const lat_rad = (lat * Math.PI) / 180.0;

const n = Math.pow(2, zoom);
const x = Math.trunc(n * ((lng + 180.0) / 360.0));
const y = Math.trunc(
  (n * (1 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI)) / 2
);

console.log(x, y);
