import warnings
from datetime import datetime, timedelta

from airflow.models.dag import DAG
from airflow.contrib.operators.spark_submit_operator import SparkSubmitOperator
from airflow.providers.cncf.kubernetes.operators.spark_kubernetes import SparkKubernetesOperator
from airflow.providers.cncf.kubernetes.sensors.spark_kubernetes import SparkKubernetesSensor
from airflow.utils.dates import days_ago

DEFAULT_TASK_ARGS = {
  'start_date': days_ago(1),
  'max_active_runs': 1,
}

with DAG(
  dag_id="spark_dag",
  default_args=DEFAULT_TASK_ARGS,
  schedule_interval=timedelta(minutes=1),
) as dag, warnings.catch_warnings(record=True):

  config = {
    "master": "spark://MASTER-IP-ADDRESS:MASTER-PORT",
    "deploy-mode": "cluster",
    "class": "com.podra.spark.ClusterApp",
    "application": "spark@MASTER-IP-ADDRESS:/jars/ClusterApp.jar",
    "executor-cores": 1,
    "EXECUTORS_MEM": "2G"
  }

  SparkSubmitOperator(
    task_id="spark_job",
    dag=dag,
    application="",
    deploy_mode="cluster",
  )

