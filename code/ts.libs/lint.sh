
# Format code.
node node_modules/prettier/bin-prettier --write 'src/**/*.ts{,x}'

# Lint.
node node_modules/eslint/bin/eslint 'src/**/*.ts{,x}' --fix $@
