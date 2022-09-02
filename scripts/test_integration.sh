#!/bin/sh

TS_NODE_TRANSPILE_ONLY=true \
TS_NODE_PROJECT="./tsconfig.tests.json" \
node \
  -r ts-node/register \
	--loader ts-node/esm \
  --test ./src/__tests__/integration*.mts
