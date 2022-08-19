#!/bin/sh

set -e;

# Compile
tsc -p ./tsconfig.cjs.json;

# Process source files
for i in $( ls ./dist/cjs/*.js ); do
	# Rename source files
	mv $i ${i%.*}.cjs;

	# Fix map references inside source files
	sed -Ei 's/\/\/# sourceMappingURL=(.+)\.js\.map/\/\/# sourceMappingURL=\1.cjs.map/g' "${i%.*}.cjs";
done;

# Process source maps
for i in $( ls ./dist/cjs/*.js.map ); do
	# Rename sourcemap files
	ii="${i%.*}"
	mv $i ${ii%.*}.cjs.map;

	# Fix source file refences inside maps
	sed -Ei 's/"file":"(.+)\.js"/"file":"\1.cjs"/g' "${ii%.*}.cjs.map";
done
