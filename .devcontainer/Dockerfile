# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.194.0/containers/alpine/.devcontainer/base.Dockerfile

FROM mcr.microsoft.com/vscode/devcontainers/base:0-alpine-3.14

RUN \
    apk update; \
    apk add --no-cache curl; \
    # Install Node
    apk add --no-cache nodejs yarn; \
    # Install Python and dependencies to support Airflow development
    apk add --no-cache \
      gcc musl-dev openssl-dev libffi-dev cargo \
      python3 python3-dev py-pip py3-pandas; \
    ln -s python3.9 /usr/bin/python; \
    pip install --upgrade pip; \
    pip install apache-airflow; \
    # Install kubectl
    KUBECTL_URI=https://storage.googleapis.com/kubernetes-release/release/; \
    KUBECTL_VER=$(curl -s $KUBE_RELEASE_URI/stable.txt); \
    KUBECTL=/usr/local/bin/kubectl; \
    curl -sSL -o $KUBECTL $KUBECTL_URI/$KUBECTL_VER/bin/linux/amd64/kubectl; \
    chmod +x $KUBECTL; \
    # Install Helm
    HELM=https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3; \
    curl -s $HELM | bash -;

COPY .devcontainer/copy-kubeconfig.sh /usr/local/share/
RUN KUBECONFIG_SOURCE=/usr/local/share/copy-kubeconfig.sh; \
    echo $KUBECONFIG_SOURCE | tee -a /root/.bashrc >> /root/.zshrc
