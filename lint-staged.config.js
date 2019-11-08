module.exports = {
  '*.ts': [
    'eslint --cache --fix',
    'git add',
    'yarn test --bail --findRelatedTests',
  ],
  '*.{js,ts,json,css,md}': ['prettier --write', 'git add'],
}
