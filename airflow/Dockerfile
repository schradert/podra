FROM apache/airflow:2.1.4rc1-python3.9
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY dags dags