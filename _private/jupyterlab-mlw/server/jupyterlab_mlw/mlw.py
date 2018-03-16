"""
This is a Module
"""


class MLW:
    """
    A single parent Class which has all the individual methods in it.
    """

    def __init__(self):
        self.url_params={}

    def urlParams(self):
        return self.url_params

    def setUrlParams(self,url_params):
        self.url_params=url_params
