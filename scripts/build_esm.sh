#!/bin/sh

tsc -p ./tsconfig.esm.json && \
for i in $( ls ./dist/esm/*.js ); do mv $i ${i%.*}.mjs; done && \
for i in $( ls ./dist/esm/*.js.map ); do
  ii="${i%.*}"
  mv $i "${ii%.*}.mjs.map";
	sed -Ei 's/"file":"(.+)\.js"/"file":"\1.mjs"/g' "${ii%.*}.mjs.map";
done
