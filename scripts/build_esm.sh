#!/bin/sh

tsc -p ./tsconfig.esm.json && \
for i in $( ls ./dist/esm/*.js ); do mv $i ${i%.*}.mjs; done && \
for i in $( ls ./dist/esm/*.js.map ); do
  ii="${i%.*}"
  mv $i "${ii%.*}.mjs.map";

	# Fix source file refences inside maps
	sed -Ei 's/"file":"(.+)\.js"/"file":"\1.mjs"/g' "${ii%.*}.mjs.map";

	# Fix map references inside source files
	sed -Ei 's/\/\/# sourceMappingURL=(.+)\.js\.map/\/\/# sourceMappingURL=\1.mjs.map/g' "${ii%.*}.mjs";
done
