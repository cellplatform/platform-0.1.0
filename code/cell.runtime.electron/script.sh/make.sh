# 
# Package ("make") the application into a distributable binary.
# 

yarn cmd prepare make --force
export NODE_ENV=production



# Bundle the runtime JS
cd ../cell.modules/pkg.sys/runtime.electron
yarn bundle
cd ../../../cell.runtime.electron



# Build the electron "/app"
cd app 
npm version minor



# Intel (64-bit)
yarn make --arch x64
ts-node -T ../script.ts/rename-dmg-arch.ts x64 

# ARM (64-bit)
yarn make --arch arm64
ts-node -T ../script.ts/rename-dmg-arch.ts arm64 



# Finish up
cd ..
yarn open
yarn prep-dev
