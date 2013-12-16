#!/bin/sh

MAIN_BRANCH="master"


while [ "$1" != "" ]; do
  PARAM=`echo $1 | awk -F= '{print $1}'`
  VALUE=`echo $1 | awk -F= '{print $2}'`
  case $PARAM in
    -h | --help)
      echo "By default this script run only on the main branch : $MAIN_BRANCH"
      echo "Use -b or --branch to change it."
      echo "authentication.sh --branch=develop"
      echo ""
      exit 0
      ;;
    --branch)
      MAIN_BRANCH=$VALUE
      ;;
    *)
      echo "ERROR: unknown parameter \"$PARAM\""
      usage
      exit 1
      ;;
  esac
  shift
done

[  "$TRAVIS_PULL_REQUEST" != "false" ] || [  "$TRAVIS_BRANCH" != "$MAIN_BRANCH" ] && exit 0

#
# Authentication
#
echo -e ">>> AngularUI (angular-ui@googlegroups.com) authentication!\n"

git remote set-url origin $REPO.git
git config --global user.email "angular-ui@googlegroups.com"
git config --global user.name "AngularUI (via TravisCI)"

if [ -z "$id_rsa_{1..23}" ]; then echo 'No $id_rsa_{1..23} found !' ; exit 1; fi

echo -n $id_rsa_{1..23} >> ~/.ssh/travis_rsa_64
base64 --decode --ignore-garbage ~/.ssh/travis_rsa_64 > ~/.ssh/id_rsa

chmod 600 ~/.ssh/id_rsa

echo -e ">>> Copy config"
mv -fv node_modules/component-publisher/travis/ssh-config ~/.ssh/config

echo -e ">>> Hi github.com !"
ssh -T git@github.com

if [ $? -eq 255 ]; then echo '>>> Authentication Fail !'; exit 3; fi

echo -e "\n"
