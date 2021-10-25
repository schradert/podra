
Example of running beam pipeline from command line
```bash
# 1. build and push container for cross-language SDK
export DOCKER_ROOT="Your Docker Repository Root"
./gradlew :sdks:java:container:java8:docker \
    -Pdocker-repository-root=$DOCKER_ROOT \
    -Pdocker-tag=latest
docker push $DOCKER_ROOT/beam_java8_sdk:latest

# 2. example of running beam pipeline with kafka sink
export PROJECT="$(gcloud config get-value project)"
export TEMP_LOCATION="gs://MY-BUCKET/temp"
export REGION="us-central1"
export JOB_NAME="kafka-taxi-`date +%Y%m%d-%H%M%S`"
export BOOTSTRAP_SERVERS="123.45.67.89:1234"
export EXPANSION_ADDR="localhost:1234"
go run ./sdks/go/examples/kafka/types/types.go \
  --runner=DataflowRunner \
  --temp_location=$TEMP_LOCATION \
  --staging_location=$STAGING_LOCATION \
  --project=$PROJECT \
  --region=$REGION \
  --job_name="${JOB_NAME}" \
  --bootstrap_servers=$BOOTSTRAP_SERVER \
  --experiments=use_portable_job_submission,use_runner_v2 \
  --expansion_addr=$EXPANSION_ADDR \
  --sdk_harness_container_image_override=".*java.*,${DOCKER_ROOT}/beam_java8_sdk:latest"
```
