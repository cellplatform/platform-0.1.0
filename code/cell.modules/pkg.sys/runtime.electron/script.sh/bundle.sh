# 
# Run the bundle compiler.
# 
npm version patch
cell.compiler bundle $@


# 
# Copy the bundle to the electron "app" folder.
#
target=../../../cell.runtime.electron/A1/lib.bundle/sys.runtime

rm -rf      $target
mkdir -p    $target
cp -r       ./dist/web   $target
