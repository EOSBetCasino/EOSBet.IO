#!/bin/bash

# make build directory
mkdir -p build

# remove current build files
rm -rf build/*

# make directories in build folder
mkdir build/js && mkdir build/css && mkdir build/abi && mkdir build/img

# minify html
for filename in *.html; do
	npx html-minifier  --collapse-whitespace --remove-comments --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype $filename -o build/$filename
done

echo "Built html!"

# minify css
for filename in css/*.css; do
	npx csso $filename build/$filename
done

echo "Built css!"

# minify js
for filename in js/*.js; do
	npx uglifyjs -o build/$filename -- $filename 
done

echo "Built js!"

# copy over images and ABI's
cp -r img/* build/img
cp -r *.pdf build


echo "Build complete!"