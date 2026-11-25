#!/bin/bash

# Remove all gradient usage from CSS files

cd /Users/leonardclay/nardshop-app

# Find all CSS files and process them
find src -name "*.css" -type f | while read file; do
    echo "Processing: $file"
    
    # Create temp file
    temp_file="${file}.tmp"
    
    # Remove gradients line by line
    awk '
    /gradient/ {
        # Skip gradient lines but keep the property
        if ($0 ~ /background:.*gradient/) {
            print "    background: rgba(16, 185, 129, 0.08);"
            next
        }
        if ($0 ~ /background-image:.*gradient/) {
            print "    background-image: none;"
            next
        }
        if ($0 ~ /border-image-source:.*gradient/) {
            print "    border-image-source: none;"
            next
        }
    }
    { print }
    ' "$file" > "$temp_file"
    
    # Replace original file
    mv "$temp_file" "$file"
done

echo "Gradient removal complete!"
