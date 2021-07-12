# 
# Delete temporary data.
# 
sh script.sh/reset.sh


# 
# Root
# 
rm -f  yarn-error.log
rm -rf lib


# 
# Electron application
# 
cd A1
rm -f  yarn-error.log
rm -rf lib
rm -rf .tmp.common_js
rm -rf .tmp.es_module
rm -rf tmp
cd ..
