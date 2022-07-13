export const sources = [
  {
    name: "madrid",
    extension: "zip",
    zipContentName: "madrid_trees.csv",
    url: "https://challenge.greemta.eu/data/green/trees_madrid.zip",
    fieldTransformations: {
      circumference: "trunk_girth",
      diameter_crown: "crown_diameter",
    },
    area: [
      [8002, 6167],
      [8047, 6195],
    ],
  },
  {
    name: "vienna",
    extension: "csv",
    filename: "BAUMKATOGD.csv",
    url: "https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BAUMKATOGD&srsName=EPSG:4326&outputFormat=csv",
    fieldTransformations: {
      circumference: (tree) =>
        Math.round(tree.properties.STAMMUMFANG * 10) / 1000,
      diameter_crown: "crown_diameter",
      height: (tree) => tree.properties.BAUMHOEHE * 5 - 2.5,
      diameter_crown: (tree) => tree.properties.KRONENDURCHMESSER * 3 - 1.5,
    },
    area: [
      [8922, 5672],
      [8955, 5700],
    ],
  },
];
