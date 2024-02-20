#!/usr/bin/env bash
rm test-1.yaml test-2.yaml test-3.yaml test-4.puml
kpt fn source data                                    > test-1.yaml
cat test-1.yaml | node ./src/dependencies.js          > test-2.yaml
cat test-2.yaml | yq -r ".items[-1]"                  > test-3.yaml
cat test-3.yaml | node ./src/dependencies2plantuml.js > test-4.puml
