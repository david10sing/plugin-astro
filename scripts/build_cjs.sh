#!/bin/sh

tsc -p ./tsconfig.cjs.json && \
for i in $( ls ./dist/cjs/*.js ); do mv $i ${i%.*}.cjs; done && \
for i in $( ls ./dist/cjs/*.js.map ); do
  ii="${i%.*}"
  mv $i ${ii%.*}.cjs.map;

	# Fix source file refences inside maps
	sed -Ei 's/"file":"(.+)\.js"/"file":"\1.cjs"/g' "${ii%.*}.cjs.map";

	# Fix map references inside source files
	sed -Ei 's/\/\/# sourceMappingURL=(.+)\.js\.map/\/\/# sourceMappingURL=\1.cjs.map/g' "${ii%.*}.cjs";
done
