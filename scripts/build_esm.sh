#!/bin/sh

set -e;

# Compile
tsc -p ./tsconfig.esm.json;

# Sed works differently depending on whether it's the BSD or GNU variant
if [ "$(sed --version 2>/dev/null | grep GNU | wc -l)" -gt "0" ]; then
	SED_VARIANT="GNU"
else
	SED_VARIANT="BSD"
fi

# Process source files
for i in $( ls ./dist/esm/*.js ); do
	# Rename source files
	mv $i ${i%.*}.mjs;

	if [ "${SED_VARIANT}" = "BSD" ]; then
		# Fix map references inside source files
		sed -E -i '' 's/\/\/#[[:space:]]sourceMappingURL=(.+)\.js\.map/\/\/# sourceMappingURL=\1.mjs.map/g' "${i%.*}.mjs";

		# Fix imports in ESM files (we first remove existing extensions)
		sed -E -i '' 's/[[:space:]]+from[[:space:]]+'"'"'\.\/(.+)\.m?js'"'"';/ from '"'"'.\/\1'"'"';/g' "${i%.*}.mjs";
		sed -E -i '' 's/[[:space:]]+from[[:space:]]+'"'"'\.\/(.+)'"'"';/ from '"'"'.\/\1.mjs'"'"';/g' "${i%.*}.mjs";
	else
		# Fix map references inside source files
		sed -Ei 's/\/\/# sourceMappingURL=(.+)\.js\.map/\/\/# sourceMappingURL=\1.mjs.map/g' "${i%.*}.mjs";

		# Fix imports in ESM files (we first remove existing extensions)
		sed -Ei 's/\s+from\s+'"'"'\.\/(.+)\.m?js'"'"';/ from '"'"'.\/\1'"'"';/g' "${i%.*}.mjs";
		sed -Ei 's/\s+from\s+'"'"'\.\/(.+)'"'"';/ from '"'"'.\/\1.mjs'"'"';/g' "${i%.*}.mjs";
	fi;
done;

# Process source maps
for i in $( ls ./dist/esm/*.js.map ); do
	# Rename sourcemap files
	ii="${i%.*}"
	mv $i "${ii%.*}.mjs.map";

	# Fix source file refences inside maps
	if [ "${SED_VARIANT}" = "BSD" ]; then
		sed -E -i '' 's/"file":"(.+)\.js"/"file":"\1.mjs"/g' "${ii%.*}.mjs.map";
	else
		sed -Ei 's/"file":"(.+)\.js"/"file":"\1.mjs"/g' "${ii%.*}.mjs.map";
	fi;
done
