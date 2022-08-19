#!/bin/sh

set -e;

tsc -p ./tsconfig.esm.json;

for i in $( ls ./dist/esm/*.js ); do
	# Rename source files
	mv $i ${i%.*}.mjs;

	# Fix map references inside source files
	sed -Ei 's/\/\/# sourceMappingURL=(.+)\.js\.map/\/\/# sourceMappingURL=\1.mjs.map/g' "${i%.*}.mjs";

	# Fix imports in ESM files (we first remove existing extensions)
	sed -Ei 's/\s+from\s+"\.\/(.+)\.m?js";/ from ".\/\1";/g' "${i%.*}.mjs";
	sed -Ei 's/\s+from\s+"\.\/(.+)";/ from ".\/\1.mjs";/g' "${i%.*}.mjs";
done;

for i in $( ls ./dist/esm/*.js.map ); do
	# Rename sourcemap files
	ii="${i%.*}"
	mv $i "${ii%.*}.mjs.map";

	# Fix source file refences inside maps
	sed -Ei 's/"file":"(.+)\.js"/"file":"\1.mjs"/g' "${ii%.*}.mjs.map";
done
