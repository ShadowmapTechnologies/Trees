export const sources = [
  {
    name: "paris",
    zipped: false,
    extension: "geojson",
    url: "https://opendata.paris.fr/explore/dataset/les-arbres/download/?format=geojson&timezone=Europe/Berlin&lang=fr",
    fieldTransformations: {
      circumference: ({ circonferenceencm }) => circonferenceencm / 100,
      diameter_crown: ({ hauteurenm }) => hauteurenm / 2,
      height: "hauteurenm",
    },
    area: [
      [8002, 6167],
      [8047, 6195],
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
