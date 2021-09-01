echo "🤯 Nuke (cell.runtime.electron)"
pwd
echo

# 
# Nuke: Root
# 
sh script.sh/clean.sh
rm -rf node_modules

# 
# Nuke: A1 (electron application folder)
# 
cd A1
rm -rf node_modules
rm -f  yarn.lock
cd ..
