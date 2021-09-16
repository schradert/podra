```bash
NAME=podra
VERSION=1.0.1

# Create dev cluster
k3d cluster create <NAME> -c chart/kubernetes/cluster.yaml

# Airflow
kubectl create namespace airflow
helm install podra-chart chart -f chart/values.yaml -n airflow --debug
docker build -t podra-airflow-spark:<VERSION> .
k3d image import podra-airflow-spark:<VERSION> -c <NAME>
```

