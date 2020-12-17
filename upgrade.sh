#!/usr/bin/env bash

# Install plugin dependencies.
for folder in plugins/*; do
  if [ -d $folder ]; then
    cd $folder
    npm audit fix
    cd ../..
  fi
done
