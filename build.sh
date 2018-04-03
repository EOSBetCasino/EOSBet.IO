#!/bin/bash

# make build directory
mkdir -p build

# remove current build files
rm -rf build/*

# make directories in build folder
mkdir build/js && mkdir build/css && mkdir build/abi && mkdir build/img

# minify html
for filename in *.html; do
	npx html-minifier  --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype $filename -o build/$filename
done

echo "Built html!"

# minify css
for filename in css/*.css; do
	npx csso $filename build/$filename
done

echo "Built css!"

# transpile js with babel
for filename in js/*.js; do
	if [ $filename != 'js/bignumber.min.js' ] && [ $filename != 'js/web3.min.js' ];
	then
		npx babel $filename -o build/$filename
	else
		cp $filename build/$filename
	fi
done

echo "Transpiled js!"

# minify js and overwrite transpiled js
for filename in build/js/*.js; do
	npx uglifyjs -o $filename -- $filename 
done

echo "Built js!"

# copy over images and ABI's
cp -r img/* build/img
cp -r abi/* build/abi


echo "Build complete!"