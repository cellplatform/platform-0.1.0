# 
# Run the bundle compiler.
# 
npm version patch
cell.compiler bundle $@


# 
# Copy the bundle to the electron "app" folder.
#
target=../../../cell.runtime.electron/app/lib.bundle/sys.runtime

rm -rf      $target
mkdir -p    $target
cp -r       ./dist/web   $target
