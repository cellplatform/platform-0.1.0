# 
# Root
# 
rm -f  yarn-error.log
rm -rf lib/
rm -rf tmp/

# 
# Electron application
# 
cd app.electron
rm -f  yarn-error.log
rm -rf lib
rm -rf .tmp.common_js
rm -rf .tmp.es_module
rm -rf tmp
cd ..
