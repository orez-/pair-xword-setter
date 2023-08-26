set -euxo pipefail
shopt -s dotglob
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "${SCRIPT_DIR}/.."

npm run build
git worktree add --no-checkout gh-pages
mv build/* gh-pages
cd gh-pages
git add .
date=`date '+%F %H:%M:%S'`
git commit -m "Publish $date" || $(exit 0)
git push
cd -
git worktree remove gh-pages
