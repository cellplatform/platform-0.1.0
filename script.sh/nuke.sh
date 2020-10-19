echo Nuke
pwd
echo

rm -rf node_modules
rm -rf code/*/node_modules

rm -f yarn.lock
rm -f code/*/yarn.lock

cd code/cell.modules && sh script.sh/nuke.sh && cd ../../
cd code/cell.electron && sh script.sh/nuke.sh && cd ../../

