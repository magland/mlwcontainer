"""
Setup Module to setup Python Handlers for the MLW Plugin.
"""
import setuptools

setuptools.setup(
    name='jupyterlab_mlwt',
    version='0.1.0',
    packages=setuptools.find_packages(),
    install_requires=[
        'notebook',
        'psutil'
    ],
    package_data={'jupyterlab_mlw': ['*']},
)
