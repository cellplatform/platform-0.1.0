cd pkg.deployment
yarn build
cd ..

yarn cmd deploy $@
