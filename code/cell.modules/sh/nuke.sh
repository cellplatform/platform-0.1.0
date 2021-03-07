echo Nuke
pwd
echo

rm -rf pkg*/*/node_modules

rm -f yarn.lock
rm -f pkg*/*/yarn.lock
