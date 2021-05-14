echo `🤯 Nuke (cell.runtime.electron)`
pwd
echo

# 
# Root
# 
rm -rf node_modules
sh script.sh/clean.sh

# 
# Electron application
# 
cd app.electron/
rm -rf node_modules
rm -f  yarn.lock
cd ..