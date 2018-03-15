"""
This is a Handler Module with all the individual handlers for Plugin.
"""
import json
import os

from notebook.utils import url_path_join as ujoin
from notebook.base.handlers import APIHandler


class MLW_handler(APIHandler):
    """
    Parent Handler.
    """
    @property
    def mlw(self):
        return self.settings['mlw']

class MLW_save_workspace_handler(MLW_handler):
    """
    A class used to save the workspace.
    """

    def get(self):
        """
        """
        output=os.popen("mlw_save").read()
        result={
            "success":True,
            "output":output
        }
        self.finish(json.dumps(result))

    def post(self):
        """
        """
        my_data = json.loads(self.request.body.decode('utf-8'))
        #current_path = my_data["current_path"]
        #result = self.mlw.status(current_path)
        result={
            "success":False,
            "error":"Post not yet supported"
        }
        self.finish(json.dumps(result))


def setup_handlers(web_app):
    """
    Function used to setup all of the MLW_Handlers used in the file.
    Every handler is defined here, to be used in mlw.py file.
    """

    mlw_handlers = [
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
