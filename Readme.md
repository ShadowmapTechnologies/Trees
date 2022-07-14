# Trees

The following repo:

1. Downloads open data of trees defined in `sources.js`
2. Converts the tree data into [GeoJSON](https://geojson.org/) format
3. Maps property names to names used at [OSM](https://wiki.openstreetmap.org/wiki/Tag:natural=tree) and removes faulty trees
4. Creates tiles containing the trees

## Prerequisite

- Ensure you have Node and Anaconda installed
- Run `npm install` to install all Node dependencies
- Run `conda env create -f conda-trees.yaml` to create environment containing all Anaconda dependencies
- Run `conda activate conda-trees` to activate the environment

Problem with the Anaconda environment: [This might help](https://stackoverflow.com/questions/72231927/fiona-importerror-library-not-loaded-rpath-libpoppler-91-dylib).

Afterwards, run `npm run all-stages` to execute the scripts.

## 1-download.js

Run `npm run stage-1` to execute the first stage. It downloads the data (csv) as defined in `sources.js`. If the download is a ZIP file it gets extracted. Every sources corresponds to one csv file and ends up under the folder `1/unzip`.

## 2-geojson.js

Run `npm run stage-2` to execute the second stage. It uses the binary `ogr2ogr` (installed with Anaconda) to transform every csv file into a corresponding geoJSON file. Every line in the final files corresponds to one tree in geoJSON format. The files itself are not valid JSON files but a so-called [ndjson](http://ndjson.org/) files. You can find them under the folder `2/`.

## 3-transform-and-filter.js

Run `npm run stage-3` to execute the third stage. It reads every line of the geoJSON files and transforms the properties into OSM format. Afterwards every tree has for example a `height` property containing the height of the tree in meters as number. Furthermore, there is a sanity check executed for every tree. If a tree, for example has a negative height, it gets discarded. All trees passing the sanity check are written into new geoJSON files, every tree in its corresponding file, under the folder `3/`.

## 4-create-tiles.js

Run `npm run stage-4` to execute the fourth stage. It reads all geoJSON files from stage 3 and splits the trees in it corresponding tile files depending on its coordinates. The tiles can be found under the folder `dist/`.

## Afterwards

Use Mircosoft Azure Storage Explorer to upload the tiles to Azure. You can use the C# code in the Shadowmap repository in the folder `blob-storage-automation` to set the caching headers on Azure.
