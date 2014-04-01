all:
	mkdir -p data/
	curl -o data/routes.zip 'http://www.mbta.com/uploadedfiles/MBTA_GTFS.zip'
	unzip data/routes.zip -d data

clean:
	rm -rf data/
