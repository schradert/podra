#!/bin/bash

set -eux

while [[ $# -gt 0 ]]; do
  case $1 in
    -d | --debug) DEBUG=1 ;;
    -v | --verbose) VERBOSE=1 ;;
    -c | --cluster)
      CLUSTER=$2
      shift
      ;;
  esac
  shift
done

CLUSTER=${CLUSTER:-podra}

# Create dev cluster
k3d cluster create $CLUSTER -c k3d-cluster.yaml

# Add versioning configmaps
kubectl apply -f configmaps.yaml

# Access cluster through Kubeapps
kubectl create namespace kubeapps
helm install kubeapps bitnami/kubeapps -n kubeapps

# Create service account and get credentials token for accessing kubeapps
OPERATOR=kubeapps-operator
kubectl create serviceaccount $OPERATOR -n operator
kubectl create clusterrolebinding $OPERATOR \
  --clusterrole=cluster-admin \
  --serviceaccount=operator:$OPERATOR
kubectl get secret \
  $(
    kubectl get serviceaccount $OPERATOR \
      -o jsonpath='{range .secrets[*]}{.name}{"\n"}{end}' \
      | grep $OPERATOR-token
  ) \
  -o jsonpath='{.data.token}' \
  -o go-template='{{.data.token | base64decode}}' \
  && echo

# Setup async message buffer
helm install podra-kafka bitnami/kafka:latest -n kafka

# Setup each zone
ZONES=("orchestrator" "transformer" "ingestor" "loader")
DIRS=("airflow" "spark" "ingestion" "loader")
COUNTER=0
for ZONE in "${ZONES[@]}"; do

  # Set local variables from config maps
  ZONE_VERSION_NAME=${ZONE^^}_VERSION
  ZONE_VERSION=$(
    kubectl get configmap -f configmaps.yaml -o json \
      | jq -r ".data.${ZONE_VERSION_NAME}"
  )

  # Build docker images
  docker build -t podra/$ZONE:$ZONE_VERSION ${DIRS[COUNTER]}
  docker tag podra/$ZONE:$ZONE_VERSION podra/$ZONE:latest

  # Load images into kubernetes cluster
  TAGS=($ZONE_VERSION "latest")
  for TAG in "${TAGS[@]}"; do
    k3d image import podra/$ZONE:$TAG -c $CLUSTER
  done

  # Install zone chart under zone namespace
  helm install podra-$ZONE kubernetes/charts/$ZONE ${DEBUG:+--debug} -n $ZONE
done
