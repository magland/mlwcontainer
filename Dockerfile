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

# Install utils
RUN apt-get update && \
    apt-get install -y \
    curl htop git

# Install nodejs
RUN curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh && \
	bash nodesource_setup.sh
RUN apt-get update && \
    apt-get install -y \
    nodejs

# Install MountainLab
RUN apt-get update && \
	apt-get install -y \
	software-properties-common
RUN add-apt-repository -y ppa:magland/mountainlab && \
	apt-get update && \
	apt-get install -y \
	mountainlab mountainlab-mpdock

# Install jupyterlab 
RUN pip3 install jupyterlab

# Set up the jupyterlab client extensions
COPY ./_private/jupyterlab-mlw/client /working/_private/jupyterlab-mlw/client
WORKDIR /working/_private/jupyterlab-mlw/client
RUN npm install
RUN npm run build
RUN jupyter labextension install . --no-build
RUN jupyter lab build

# Set up the jupyterlab server extensions
COPY ./_private/jupyterlab-mlw/server /working/_private/jupyterlab-mlw/server
WORKDIR /working/_private/jupyterlab-mlw/server
RUN pip3 install .
RUN jupyter serverextension enable --py jupyterlab_mlw 

# Pre-install some things we are likely to want.
# Other packages specified in requirements.txt of the workspace
# will be installed at run time 
RUN pip3 install numpy requests matplotlib scipy pybind11 seaborn

# Expose the port for jupyterlab
EXPOSE 8888

# Set the working directory
RUN mkdir /working/workspace
WORKDIR /working/workspace

COPY ./_private/bin /working/_private/bin
ENV PATH "/working/_private/bin:$PATH"

ENV KBUCKET_DOWNLOAD_DIRECTORY "/working/kbucket_downloads"
ENV DEBIAN_FRONTEND "noninteractive"



################## MountainSort ####################
# Install qt5
RUN apt-add-repository ppa:ubuntu-sdk-team/ppa && \
	apt-get update && \
	apt install -y qtdeclarative5-dev qt5-default qtbase5-dev qtscript5-dev make g++
RUN apt-get update && apt install -y libfftw3-dev

WORKDIR /opt/mountainlab/packages
RUN git clone https://github.com/flatironinstitute/mountainsort
WORKDIR /opt/mountainlab/packages/mountainsort
RUN ./compile_components.sh
RUN pip3 install numpydoc
#####################################################

WORKDIR /working/workspace

CMD mlw_init

