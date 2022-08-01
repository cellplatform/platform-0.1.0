# Format code.
prettier --write 'src/**/*.ts{,x}'

# Lint.
eslint 'src/**/*.ts{,x}' --fix $@
