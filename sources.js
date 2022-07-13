export const sources = [
  {
    name: "madrid",
    filename: "madrid_trees.csv",
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
];
