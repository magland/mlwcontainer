FROM ubuntu:16.04

MAINTAINER Jeremy Magland

# Example usage:
#   Set the following environment variables in the .env file (see sample.env)
#   (Note that it is NOT sufficient to set these variables in the host OS. They must be set in the container)
#       DOCSTOR_URL
#       MLW_DOCUMENT_ID
#       MLW_ACCESS_TOKEN
#   docker build -t workspace1 .
#   docker run --env-file=.env -p 8888:8888 -it workspace1
#   In web browser: http://localhost:8888

# Python3
RUN apt-get update && \
    apt-get install -y \
    python3 python3-pip

# Install nodejs
RUN apt-get update && \
    apt-get install -y \
    nodejs nodejs-legacy npm

# Install jupyterlab 
RUN pip3 install jupyterlab

# Install utils for convenience
RUN apt-get update && \
    apt-get install -y \
    nano htop

# Pre-install some things we know we are going to want.
# Other packages specified in requirements.txt of the workspace
# will be installed at run time 
RUN pip3 install numpy requests matplotlib
RUN pip3 install jupyter

# Copy the code for initializing the repo
COPY ./_private /working/_private

# Install required node packages
WORKDIR /working/_private/node
RUN npm install

# Expose the port for jupyterlab
EXPOSE 8888

# Set the working directory
RUN mkdir /working/workspace
WORKDIR /working/workspace

ENV PATH "/working/_private/bin:$PATH"

CMD mlw_init

