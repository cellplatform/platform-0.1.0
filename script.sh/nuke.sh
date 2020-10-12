echo Nuke
pwd
echo

rm -rf node_modules
rm -rf code/*/node_modules
rm -rf code/cell.modules/packages/*/node_modules

rm -f yarn.lock
rm -f yarn-error.log

rm -f code/*/yarn.lock
rm -f code/*/yarn-error.log
