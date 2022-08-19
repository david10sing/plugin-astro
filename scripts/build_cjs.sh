#!/bin/sh

set -e;

# Compile
tsc -p ./tsconfig.cjs.json;

# Sed works differently depending on whether it's the BSD or GNU variant
if [ "$(sed --version 2>/dev/null | grep GNU | wc -l)" -gt "0" ]; then
	SED_VARIANT="GNU"
else
	SED_VARIANT="BSD"
fi

# Process source files
for i in $( ls ./dist/cjs/*.js ); do
	# Rename source files
	mv $i ${i%.*}.cjs;

	# Fix map references inside source files
	if [ "${SED_VARIANT}" = "BSD" ]; then
		sed -E -i '' 's/\/\/#[[:space:]]sourceMappingURL=(.+)\.js\.map/\/\/# sourceMappingURL=\1.cjs.map/g' "${i%.*}.cjs";
	else
		sed -Ei 's/\/\/# sourceMappingURL=(.+)\.js\.map/\/\/# sourceMappingURL=\1.cjs.map/g' "${i%.*}.cjs";
	fi;
done;

# Process source maps
for i in $( ls ./dist/cjs/*.js.map ); do
	# Rename sourcemap files
	ii="${i%.*}"
	mv $i ${ii%.*}.cjs.map;

	# Fix source file refences inside maps
	if [ "${SED_VARIANT}" = "BSD" ]; then
		sed -E -i '' 's/"file":"(.+)\.js"/"file":"\1.cjs"/g' "${ii%.*}.cjs.map";
	else
		sed -Ei 's/"file":"(.+)\.js"/"file":"\1.cjs"/g' "${ii%.*}.cjs.map";
	fi;
done;
