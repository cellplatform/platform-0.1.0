# 
# Package ("make") the application into a distributable binary.
# 
yarn cmd prepare make --force
export NODE_ENV=production


cd app.sys
yarn bundle
cd ..


cd app 
npm version minor
yarn make-x64
# yarn make-arm64
