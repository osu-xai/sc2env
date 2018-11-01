from setuptools import find_packages
from setuptools import setup

setup(name='sc2env',
    version='0.1.0',
    description='Simple StarCraftII AI environments',
    author='Larry Neal',
    author_email='nealla@lwneal.com',
    include_package_data=True,
    packages=find_packages(),
)
