# 
# Package ("make") the application.
# 
# NOTE: this is a light-weight "make" recipe only:
# 
#   - does not prepre the [node_module] folder (install locally rather than use the "yarn workspace").
#   - does not notarize the application (code-sign).
#   - does not bundle the [app.sys] module.
#   - bump verion: "patch"
# 
export NODE_ENV=production
export NOTARIZE=false 

cd app 
npm version patch
yarn make
