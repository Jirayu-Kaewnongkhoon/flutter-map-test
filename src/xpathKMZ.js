const fs = require('fs');
const JSZip = require('jszip');
const xpath = require('xpath');
const dom = require('@xmldom/xmldom').DOMParser;

// อ่านไฟล์ .kmz และแยกไฟล์ KML ออกมา
const parseKMLData = async (filepath) => {
    return await new Promise((resolve, reject) => {
        fs.readFile(filepath, (err, data) => {
            if (err) {
                reject(err);
            }
            JSZip.loadAsync(data).then((zip) => {
                zip.file('doc.kml').async('string').then((kmlString) => {

                    const doc = new dom().parseFromString(kmlString, 'text/xml');
                    const select = xpath.useNamespaces({ "kml": "http://www.opengis.net/kml/2.2" });
                    const nodes = select('//kml:coordinates/text()', doc);

                    const points = [];
                    nodes.forEach((node) => {
                        node.toString().split(' ')
                            .map(coord => coord.split(',').map(Number))
                            .filter(coord => coord.length > 1)
                            .map(coord => points.push([coord[1], coord[0]]));
                    });

                    resolve(points);

                });
            });
        });
    });
}

module.exports = {
    parseKMLData,
}