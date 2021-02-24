# 
# https://ngrok.com
# 
# DIR="$(pwd)/dist/web"
# ngrok http file://${DIR}



LOCAL="http://localhost:5000"
ngrok http ${LOCAL} --hostname="nz.ngrok.io"

