# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.194.0/containers/alpine/.devcontainer/base.Dockerfile

FROM mcr.microsoft.com/vscode/devcontainers/base:0-alpine-3.14

COPY install.sh .devcontainer/
RUN apk update; \
    apk add --no-cache curl bash; \
    bash .devcontainer/install.sh

ENV JAVA_HOME=/usr/lib/jvm/default-jvm/jre

ARG KUBECONFIG_SOURCE=/usr/local/share/copy-kubeconfig.sh
COPY copy-kubeconfig.sh /usr/local/share/
RUN echo "source $KUBECONFIG_SOURCE" | tee -a /home/vscode/.bashrc
