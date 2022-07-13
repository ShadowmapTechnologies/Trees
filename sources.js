import chalk from "chalk";

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
      circumference: ({ STAMMUMFANG }) => {
        if (STAMMUMFANG <= 0) {
          return undefined;
        }

        return Math.round(STAMMUMFANG * 10) / 1000;
      },
      height: ({ BAUMHOEHE }) => {
        if (BAUMHOEHE <= 0) {
          return undefined;
        }

        return BAUMHOEHE * 5 - 2.5;
      },
      diameter_crown: ({ KRONENDURCHMESSER }) => {
        if (KRONENDURCHMESSER <= 0) {
          return undefined;
        }

        return KRONENDURCHMESSER * 3 - 1.5;
      },
    },
    area: [
      [8922, 5672],
      [8955, 5700],
    ],
  },
];
