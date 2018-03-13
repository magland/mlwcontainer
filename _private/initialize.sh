#!/bin/bash

set -e

if [ -z "$DOCSTOR_URL" ];
then
	echo "Environment variable not set: DOCSTOR_URL"
	exit -1
fi

if [ -z "$MLW_DOCUMENT_ID" ];
then
	echo "Environment variable not set: MLW_DOCUMENT_ID"
	exit -1
fi

if [ -z "$MLW_ACCESS_TOKEN" ];
then
	echo "Environment variable not set: MLW_ACCESS_TOKEN"
	exit -1
fi

workspace_url="$DOCSTOR_URL/api/getDocument?id=$MLW_DOCUMENT_ID&access_token=$MLW_ACCESS_TOKEN&include_content=true"

cd /working
mkdir workspace
_private/node_utils/download_workspace.js --destpath=/working/workspace --workspace_url=$workspace_url
cd /working/workspace
pip3 install -r requirements.txt

jupyter lab --allow-root --port=8888 --ip=0.0.0.0 --NotebookApp.token=
