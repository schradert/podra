from datetime import timedelta
from airflow import DAG 
from airflow.providers.cncf.kubernetes.operators.kubernetes_pod import KubernetesPodOperator
from airflow.operators.bash import BashOperator
from airflow.utils.dates import days_ago
from airflow.kubernetes.secret import Secret

from kubernetes.client import models as k8s

with DAG(
    dag_id='data_ingestion_operator',
    schedule_interval=timedelta(minutes=10),
    start_date=days_ago(2),
    tags=['ingestion']
) as dag:
    kube = KubernetesPodOperator(
        namespace='default',
        image='node:14-alpine',
        cmds=['bash', '-cx'],
        arguments=['yarn', 'start'],
        labels={'zone': 'ingestion'},
        secrets=[
            Secret('env', 'REDDIT_TOKEN', 'ingestor-secrets')
        ],
        ports=[k8s.V1ContainerPort(name='http', container_port=80)],
        name='ingestion-pod',
        task_id='ingestion',
        is_delete_operator_pod=True,
        in_cluster=True,
        get_logs=True,
        # hostnetwork=False,
        priority_class_name='medium',
        retries=3
    )

    pod_result = BashOperator(
        bash_command='echo {{ task_instance }}',
        task_id='pod_results_printer'
    )

    kube >> pod_result