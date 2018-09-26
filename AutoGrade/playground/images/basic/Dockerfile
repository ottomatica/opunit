FROM ubuntu:16.04
ARG APT_PROXY_PORT=

# Install sudo
RUN apt-get update && apt-get install -y sudo

# name: Install python, netcat, and route
RUN sudo apt install -y python-minimal netcat-openbsd net-tools 

COPY scripts/detect-apt-proxy.sh /root
RUN /root/detect-apt-proxy.sh ${APT_PROXY_PORT}



