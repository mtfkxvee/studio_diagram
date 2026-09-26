from setuptools import find_packages, setup

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

setup(
	name="diagram_studio",
	version="0.0.1",
	description="Editor diagram di dalam ERPNext yang node-nya bisa terhubung ke data ERP asli.",
	author="X-Sha",
	author_email="it@x-sha.id",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires,
)
