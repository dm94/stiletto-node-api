## Stiletto API

This API is designed with fastify.

[Documentation](https://bump.sh/doc/stiletto-api)

### Stiletto Project

Frotend from this project: https://github.com/dm94/stiletto-web

Web with different utilities for the game Last Oasis, but is not affiliated with [Donkey Crew](https://www.donkey.team/)

It is created with JS (react), HTML, CSS (bootstrap) and API fastify

You can see this website in operation here: [https://stiletto.deeme.dev/](https://stiletto.deeme.dev/)

## Installation

With npm

```bash
  npm install
  npm run dev
```

With pnpm

```bash
  pnpm install
  pnpm run dev
```

## Swagger UI
Only enabled for the development environment

http://localhost:8080/doc

#### Images

In the same place as the API I also host the images that the web loads.
These images are placed in different folders as follows:

- "maps" : It contains the maps generated with leaflet each map has its own folder and in the main folder it contains a image of each map
- "markers" : Custom markers for each resource are placed with the resource name in .png format. If the resource has spaces it is replaced by \_ and each word is written with the first letter in capital letters. Example: Nibiran Mineral => Nibiran_Mineral.png
- "items" : Images for each item are placed with the name of the item in .png format. If the resource has spaces it is replaced by \_ and each word is written with the first letter in capital letters. Example: Nibiran Mineral => Nibiran_Mineral.png

#### Generate maps

Library: [gdal2tiles-leaflet](https://github.com/commenthol/gdal2tiles-leaflet)

Command to generate it:
`python gdal2tiles.py -l -p raster -z 0-5 -w none <image> <folder>`
