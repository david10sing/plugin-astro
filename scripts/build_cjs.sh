#!/bin/sh

tsc -p ./tsconfig.cjs.json && \
for i in $( ls ./dist/cjs/*.js ); do mv $i ${i%.*}.cjs; done && \
for i in $( ls ./dist/cjs/*.js.map ); do
  ii="${i%.*}"
  mv $i ${ii%.*}.cjs.map;
	sed -Ei 's/"file":"(.+)\.js"/"file":"\1.cjs"/g' "${ii%.*}.cjs.map";
done
