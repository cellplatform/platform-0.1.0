echo Nuke
pwd
echo

sh script.sh/clean.sh

cd app.electron
rm -rf node_modules
rm -f  yarn.lock
cd ..