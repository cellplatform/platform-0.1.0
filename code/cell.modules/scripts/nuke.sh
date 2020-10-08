
rm -rf node_modules
rm     yarn.lock

rm -rf modules/*/node_modules/
rm -rf modules/*/yarn.lock

yarn
