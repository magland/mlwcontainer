#!/bin/bash

set -e

workspace_url=$1

cd /working
mkdir workspace
_private/node_utils/download_workspace.js --destpath=/working/workspace --workspace_url=$workspace_url
cd /working/workspace
pip3 install -r requirements.txt

jupyter lab --allow-root --port=8888 --ip=0.0.0.0 --NotebookApp.token=
