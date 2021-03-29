cd pkg.deployment
yarn build
cd ..

yarn cell deploy $@
