# 
# https://ngrok.com
# 
DIR="$(pwd)/dist/web"
ngrok http file://${DIR}
