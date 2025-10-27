#!/bin/bash
for file in ./assets/images/*; do
    echo "processinf files $file"
    convert "$file" -quality 70 "$file"
done