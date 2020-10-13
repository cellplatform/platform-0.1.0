echo Nuke
pwd
echo

rm -rf node_modules
rm -rf code/*/node_modules
rm -rf code/cell.modules/*/node_modules

rm -f yarn.lock
rm -f code/*/yarn.lock
rm -f code/cell.modules/*/yarn.lock
