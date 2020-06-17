yarn clean
parcel build src/html/*.html \
              --no-source-maps \
              --experimental-scope-hoisting 

cp app.json dist/app.json
open .
