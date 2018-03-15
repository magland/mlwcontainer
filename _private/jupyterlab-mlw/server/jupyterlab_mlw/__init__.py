"""
Python module to initialize Server Extension & Notebook Extension
"""
from jupyterlab_mlw.handlers import setup_handlers
from jupyterlab_mlw.mlw import MLW


def _jupyter_server_extension_paths():
    """
    Function to declare Jupyter Server Extension Paths.
    """
    return [{
        'module': 'jupyterlab_mlw',
    }]


def _jupyter_nbextension_paths():
    """
    Function to declare Jupyter Notebook Extension Paths.
    """
    return [{"section": "notebook", "dest": "jupyterlab_mlw"}]


def load_jupyter_server_extension(nbapp):
    """
    Function to load Jupyter Server Extension.
    """
    print('****************************************** Loading jupyter server extension: mlw');
    file = open('/tmp/mlw.txt','w') 
    file.write('This is a test') 
    file.close() 

    mlw = MLW()
    nbapp.web_app.settings['mlw'] = mlw
    setup_handlers(nbapp.web_app)
