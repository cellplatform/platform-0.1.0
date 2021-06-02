# 
# Package ("make") the application.
# 
export NODE_ENV=production
yarn prep-make


cd app.sys
yarn bundle
cd ..


cd app 
npm version minor
yarn make
