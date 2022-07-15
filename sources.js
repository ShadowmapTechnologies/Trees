export const sources = [
  {
    name: "paris",
    zipped: false,
    extension: "geojson",
    url: "https://opendata.paris.fr/explore/dataset/les-arbres/download/?format=geojson&timezone=Europe/Berlin&lang=fr",
    fieldTransformations: {
      circumference: ({ circonferenceencm }) => circonferenceencm / 100,
      diameter_crown: ({ hauteurenm }) => Math.max(hauteurenm * 0.65, 31),
      height: "hauteurenm",
    },
    area: [
      [8258, 5605], // https://www.google.com/maps/place/Manoir+de+Corny/@49.306417,1.4581306,12.73z/data=!4m13!1m7!3m6!1s0x47e66e1f06e2b70f:0x40b82c3688c9460!2sParis,+France!3b1!8m2!3d48.856614!4d2.3522219!3m4!1s0x0:0x82952d758fe73527!8m2!3d49.2835528!4d1.4537377
      [8340, 5656], // https://www.google.com/maps/place/77160+Provins,+France/@48.5628878,3.267,14z/data=!3m1!4b1!4m13!1m7!3m6!1s0x47e66e1f06e2b70f:0x40b82c3688c9460!2sParis,+France!3b1!8m2!3d48.856614!4d2.3522219!3m4!1s0x47ef31086268d359:0x40b82c3688c4f00!8m2!3d48.5601362!4d3.29916
    ],
  },
  {
    name: "madrid",
    zipped: true,
    zipContentName: "madrid_trees.csv",
    extension: "csv",
    url: "https://challenge.greemta.eu/data/green/trees_madrid.zip",
    fieldTransformations: {
      circumference: ({ trunk_girth }) => parseFloat(trunk_girth),
      diameter_crown: ({ crown_diameter }) => parseFloat(crown_diameter),
      height: ({ height }) => parseFloat(height),
    },
    area: [
      [8002, 6167],
      [8047, 6195],
    ],
  },
  {
    name: "vienna",
    zipped: false,
    extension: "csv",
    filename: "BAUMKATOGD.csv",
    url: "https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BAUMKATOGD&srsName=EPSG:4326&outputFormat=csv",
    fieldTransformations: {
      circumference: ({ STAMMUMFANG }) => {
        const c = parseFloat(STAMMUMFANG);
        return c <= 0 ? undefined : Math.round(c * 10) / 1000;
      },
      height: ({ BAUMHOEHE }) => {
        const h = parseFloat(BAUMHOEHE);
        return h <= 0 ? undefined : h * 5 - 2.5;
      },
      diameter_crown: ({ KRONENDURCHMESSER }) => {
        const d = parseFloat(KRONENDURCHMESSER);
        return d <= 0 ? undefined : d * 3 - 1.5;
      },
    },
    area: [
      [8922, 5672],
      [8955, 5700],
    ],
  },
];
