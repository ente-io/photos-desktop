#!/bin/sh

set -o errexit

version="$1"
if test -z "$version"
then
    echo "usage: `basename $0` <version-including-v>"
    exit 1
fi

set -o xtrace

cp ../ente/desktop/CHANGELOG.md CHANGELOG.md
cp ../ente/desktop/.github/workflows/desktop-release.yml .github/workflows/
git add CHANGELOG.md .github/workflows/desktop-release.yml
git commit -m "$version"
git push origin main

git tag "$version"
git push origin "$version"
