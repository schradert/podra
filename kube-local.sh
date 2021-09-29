#!/bin/bash

NAME=podra
VERSION=1.0.1

# Create dev cluster
k3d cluster create $NAME -c chart/k3d-cluster.yaml

# Build docker images
docker build -t podra-airflow:$VERSION .
docker build -t podra-spark:$VERSION .
docker build -t podra-kafka:$VERSION .

# Load images into kubernetes cluster
k3d image import podra-airflow:$VERSION -c $NAME
k3d image import podra-spark:$VERSION -c $NAME
k3d image import podra-airflow:$VERSION -c $NAME

# Install main cluster chart
helm install podra-chart chart --debug

# Access cluster through Kubeapps
kubectl create namespace kubeapps
helm install kubeapps bitnami/kubeapps -n kubeapps

# Create service account and get credentials token for accessing kubeapps
kubectl create serviceaccount kubeapps-op -n default
kubectl create clusterrolebinding kubeapps-op --clusterrole=cluster-admin --serviceaccount
=default:kubeapps-op
kubectl get secret $(kubectl get serviceaccount kubeapps-operator -o jsonpath='{range .secrets[*]}{.name}{"\n"}{end}' | grep kubeapps-operator-token) -o jsonpath='{.data.token}' -o go-template='{{.data.token | base64decode}}' && echo