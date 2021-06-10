# 
# Package ("make") the application.
# 
yarn cmd prepare make --force
export NODE_ENV=production


cd app.sys
yarn bundle
cd ..


cd app 
npm version minor
yarn make
