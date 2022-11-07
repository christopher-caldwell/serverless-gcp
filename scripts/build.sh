#!/bin/sh

if [ $? != 0 ]; then
  printf "\n\n$Red$(echo Build failed.)$Color_Off"
  exit 1
fi

tsc -p tsconfig.build.json

if [ $? != 0 ]; then
  printf "\n\n$Red$(echo Build failed.)$Color_Off"
  exit 1
fi

tscpaths -p tsconfig.json -s src -o dist

if [ $? != 0 ]; then
  printf "\n\n$Red$(echo Build failed.)$Color_Off"
  exit 1
fi

cp -r ./src/package/templates ./dist/package/templates

if [ $? != 0 ]; then
  printf "\n\n$Red$(echo Build failed.)$Color_Off"
  exit 1
fi