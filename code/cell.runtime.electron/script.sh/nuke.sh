echo Nuke
pwd
echo

sh script.sh/clean.sh

rm -rf app/node_modules
rm -f  app/yarn.lock
