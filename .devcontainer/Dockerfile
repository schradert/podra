# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.194.0/containers/alpine/.devcontainer/base.Dockerfile

FROM mcr.microsoft.com/vscode/devcontainers/base:0-alpine-3.14

RUN \
    apk update; \
    apk add --no-cache \
      nodejs \
      yarn \
      python3;
ENV PATH=/home/vscode/.yarn/bin:${PATH}