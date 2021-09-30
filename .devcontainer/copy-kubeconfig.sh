#!/bin/bash -i

# Copies ~/.kube/config file into the container and swap out localhost
# for host.docker.internal whenever a new shell starts to keep them in sync.
KUBE_LOCAL=/usr/local/share/kube-localhost
KUBE=/home/vscode/.kube
KUBECONFIG=$KUBE/config
if [[ $SYNC_LOCALHOST_KUBECONFIG = "true" ]] && [[ -d $KUBE_LOCAL ]]; then
  mkdir -p $KUBE
  sudo cp -r $KUBE_LOCAL/* $KUBE
  sudo chown -R $(id -u) $KUBE
  sed -i -e "s/localhost/host.docker.internal/g" $KUBECONFIG
  sed -i -e "s/127.0.0.1/host.docker.internal/g" $KUBECONFIG
  sed -i -e "s/0.0.0.0/host.docker.internal/g" $KUBECONFIG
fi