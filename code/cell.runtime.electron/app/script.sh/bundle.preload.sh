# 
# See:
#     https://www.electronjs.org/docs/api/sandbox-option
# 
# Note:
#     Bundling the preload script is necessary as the code runs in a
#     limited node-like environment and can only be a single file.
# 

browserify lib/renderer/preload.js \
  -x electron \
  --insert-global-vars=__filename,__dirname \
  -o lib/preload.js

# 
# Copy bundled system JS into app folder.
# 
rm -rf ./lib.bundle
mkdir -p ./lib.bundle/app.sys
cp -r ../app.sys/dist/web ./lib.bundle/app.sys/web
