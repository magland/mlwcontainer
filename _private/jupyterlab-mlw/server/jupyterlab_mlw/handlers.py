"""
This is a Handler Module with all the individual handlers for Plugin.
"""
import json
import os
import requests

from notebook.utils import url_path_join as ujoin
from notebook.base.handlers import APIHandler


class MLW_handler(APIHandler):
    """
    Parent Handler.
    """
    @property
    def mlw(self):
        return self.settings['mlw']

    def read_text_file(self,fname):
        with open(fname, 'r') as F:
            return F.read()

    def write_text_file(self,fname,txt):
        with open(fname, 'w') as F:
            F.write(txt)

class MLW_load_workspace_handler(MLW_handler):
    """
    A class used to load the workspace.
    """

    def get(self):
        """
        """
        self.post()

    def post(self):
        """
        """
        post_data = json.loads(self.request.body.decode('utf-8'))
        self.mlw.setUrlParams(post_data)

        result = self.load_workspace(self.mlw.urlParams())

        self.finish(json.dumps(result))

    def load_workspace(self,params):
        print('Loading workspace...')

        self.mlw

        mlw_document_fname = '/working/_private/data/workspace.mlw'
        workspace_path = '/working/workspace'

        try:
            url='{}/api/getDocument?id={}&include_content=true&access_token={}'.format(params['docstor_url'],params['mlw_document_id'],params['mlw_access_token'])

            print('Downloading workspace document: {} ...'.format(url))
            r = requests.get(url=url)
            resp = r.json()
            if not resp['success']:
                return {"success":False,"error":"Error loading workspace document: {}".format(resp['error'])}

            mlw_document=json.loads(resp['content'])

            print('Writing document to {}'.format(mlw_document_fname))
            self.write_text_file(mlw_document_fname,json.dumps(mlw_document))

            # Just to make sure that the mlw_document is consistent with what is now on the disk
            print('Reading document from {}'.format(mlw_document_fname))
            mlw_document = json.load(open(mlw_document_fname))

            print(mlw_document.keys())
            if not ('files' in mlw_document):
                mlw_document['files'] = {}
            files=mlw_document['files']
            print(files.keys())
            for key in files:
                txt=files[key]['content']
                print('Writing file {} ...'.format(key))
                self.write_text_file(os.path.join(workspace_path,key),txt)
        except Exception as err:
            return {"success":False,"error":str(err)}

        print('Done loading workspace.')
        return {"success":True}

class MLW_save_workspace_handler(MLW_handler):
    """
    A class used to save the workspace.
    """

    def get(self):
        """
        """
        self.post()

    def post(self):
        """
        """
        post_data = json.loads(self.request.body.decode('utf-8'))

        result = self.save_workspace(self.mlw.urlParams())

        self.finish(json.dumps(result))

        #output=os.popen("mlw_save").read()
        #result={
        #    "success":True,
        #    "output":output
        #}
        #self.finish(json.dumps(result))

    def save_workspace(self,params):
        print('Saving workspace...')

        mlw_document_fname = '/working/_private/data/workspace.mlw'
        workspace_path = '/working/workspace'

        try:
            print('Reading document from {}'.format(mlw_document_fname))
            mlw_document = json.load(open(mlw_document_fname))

            print(mlw_document.keys())
            if not ('files' in mlw_document):
                mlw_document['files'] = {}
            files=mlw_document['files']
            print(files.keys())
            for key in files:
                fname0=os.path.join(workspace_path,key)
                if os.path.isfile(fname0):
                    print('Reading file {} ...'.format(key))
                    txt=self.read_text_file(fname0)                
                    files[key]['content']=txt
                else:
                    print('Removing file {} ...'.format(key))
                    del files[key]

            allfiles = [f for f in os.listdir(workspace_path) if os.path.isfile(os.path.join(workspace_path, f))]
            for key in allfiles:
                if not (key in files):
                    print('Reading new file {} ...'.format(key))
                    fname0=os.path.join(workspace_path,key)
                    txt=self.read_text_file(fname0)
                    files[key]={}
                    files[key]['content']=txt

            print('Writing document: {}'.format(mlw_document_fname))
            self.write_text_file(mlw_document_fname,json.dumps(mlw_document))

            url='{}/api/setDocument?id={}&access_token={}'.format(params['docstor_url'],params['mlw_document_id'],params['mlw_access_token'])
            print('Uploading document to: {}'.format(url))
            r = requests.post(url,json={"content":json.dumps(mlw_document)})
            resp = r.json()
            if not resp['success']:
                return {"success":False,"error":"Error uploading workspace document: {}".format(resp['error'])}

        except Exception as err:
            return {"success":False,"error":str(err)}

        print('Done saving workspace.')
        return {"success":True}

def setup_handlers(web_app):
    """
    Function used to setup all of the MLW_Handlers used in the file.
    Every handler is defined here, to be used in mlw.py file.
    """

    mlw_handlers = [
        ('/mlw/load_workspace', MLW_load_workspace_handler),
        ('/mlw/save_workspace', MLW_save_workspace_handler)
    ]

    # add the baseurl to our paths
    base_url = web_app.settings['base_url']
    mlw_handlers = [
        (ujoin(base_url, x[0]), x[1])
        for x in mlw_handlers
    ]
    print("base_url: {}".format(base_url))
    print(mlw_handlers)

    web_app.add_handlers('.*', mlw_handlers)


def print_handlers():
    mlw_handlers = [
        ('/mlw/save_workspace', MLW_save_workspace_handler)
    ]

    # add the baseurl to our paths
    base_url = ''
    mlw_handlers = [
        (ujoin(base_url, x[0]), x[1])
        for x in mlw_handlers
    ]
