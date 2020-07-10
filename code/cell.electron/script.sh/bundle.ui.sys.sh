# Build bundle.
cd ../cell.ui.sys
yarn bundle

# Copy bundle.
cd ../cell.electron
mkdir -p app/.bundle
rm -rf app/.bundle/cell.ui.sys
cp -rf ../cell.ui.sys/dist app/.bundle/cell.ui.sys

