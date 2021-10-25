#!/bin/bash

# Install Node
apk add --no-cache nodejs yarn npm

# Install Prettier for formatting
npm i -g prettier prettier-plugin-sh

# Install Python and dependencies to support Airflow development
apk add --no-cache \
  gcc musl-dev openssl-dev libffi-dev cargo \
  python3 python3-dev py-pip py3-pandas
ln -s python3.9 /usr/bin/python
pip install --upgrade pip
pip install apache-airflow

# Install Java & Scala
apk add --no-cache openjdk11
SBT=https://github.com/sbt/sbt/releases/download/v1.5.5/sbt-1.5.5.tgz
curl -fsSL $SBT | tar xvz -C /usr/lib
ln -s /usr/lib/sbt/bin/sbt /usr/bin/sbt

# Install kubectl
KUBECTL_URI=https://storage.googleapis.com/kubernetes-release/release
KUBECTL_VER=$(curl -s $KUBECTL_URI/stable.txt)
KUBECTL=/usr/local/bin/kubectl
curl -sSL -o $KUBECTL $KUBECTL_URI/$KUBECTL_VER/bin/linux/amd64/kubectl
chmod +x $KUBECTL

# Install Helm
apk add --no-cache openssl
HELM=https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
wget -4 $HELM -O - | bash

# rust-analyzer language server needs source code
apk add rust-src
