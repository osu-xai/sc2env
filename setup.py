from setuptools import setup, find_packages

setup(name='sc2env',
    version='0.1.6',
    description='Simple StarCraftII AI environments',
    author='Larry Neal',
    author_email='nealla@lwneal.com',
    packages=[
        'sc2env',
        'sc2env/environments',
        'sc2env/maps',
    ],
    package_data={
        'sc2env': ['maps/*.SC2Map'],
    },
)
