#!/bin/bash

# make build directory
mkdir -p build

# remove current build files
rm -rf build/*

# make directories in build folder
mkdir build/assets && mkdir build/assets/css && mkdir build/assets/fonts && mkdir build/assets/js && mkdir build/images

# minify html
for filename in *.html; do
	npx html-minifier  --collapse-whitespace --remove-comments --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype $filename -o build/$filename
done

echo "Built html!"

# minify css
for filename in ./assets/css/*.css; do
	npx csso $filename build/$filename
done

echo "Built css!"

# minify js
for filename in ./assets/js/*.js; do
	npx uglifyjs -o build/$filename -- $filename 
done

echo "Built js!"

# copy over images, pdf, robots, fonts
cp -r images/* build/images
cp -r *.pdf build
cp robots.txt build
cp -r assets/fonts/* build/assets/fonts


echo "Build complete!"