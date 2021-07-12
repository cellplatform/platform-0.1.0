echo "🤯 Nuke (cell.runtime.electron)"
pwd
echo

# 
# Nuke: Root
# 
rm -rf node_modules
sh script.sh/clean.sh

# 
# Nuke: A1 (electron application folder)
# 
cd A1
rm -rf node_modules
rm -f  yarn.lock
cd ..
