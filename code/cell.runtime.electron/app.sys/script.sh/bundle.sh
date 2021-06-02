# 
# Run the bundle compiler.
# 
cell.compiler bundle $@



# 
# Copy the bundle to the [electron] "app" folder.
#
rm -rf   ../app/lib.bundle/app.sys
mkdir -p ../app/lib.bundle/app.sys
cp -r    ./dist/web ../app/lib.bundle/app.sys/web

