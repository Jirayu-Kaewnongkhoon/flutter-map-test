const express = require('express');
const cors = require('cors');
const unzipper = require('unzipper');
const xml2js = require('xml2js');
// const xpath = require('xpath');
// const dom = require('xmldom').DOMParser

const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());

// ตั้งค่าการเรียกใช้งานไฟล์ static
app.use(express.static(path.join(__dirname, 'public')));

app.get('/kmz', (req, res) => {
    const filepath = path.join(__dirname, 'public', 'kmz', '20220517_ky_map_block13_flight1_kml.kmz');
    
    fs.createReadStream(filepath)
        .pipe(unzipper.Parse())
        .on('entry', async function (entry) {
            const fileName = entry.path;
            if (fileName.endsWith('.kml')) {
                const kmlData = await new Promise((resolve, reject) => {
                    let chunks = [];

                    entry.on('data', (chunk) => {
                        chunks.push(chunk);
                    });

                    entry.on('end', () => {
                        const xml = Buffer.concat(chunks).toString();
                        xml2js.parseString(xml, (err, result) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result.kml);
                            }
                        });
                    });
                    
                    entry.on('error', (err) => {
                        reject(err);
                    });
                });

                res.json(parseKMLData(kmlData));
            } else {
                entry.autodrain();
            }
        });
})

// สร้างเส้นทางสำหรับการเรียกใช้งานแผนที่
// app.get('/', function(req, res) {
//     res.sendFile(path.join(__dirname + '/index.html'));
// });

// เปิดพอร์ตและเริ่มต้น Server
app.listen(3000, function() {
    console.log('Map Server started on port 3000...');
});

const parseKMLData = (kmlData) => {
    const geojson = [];

    kmlData.Folder[0].Placemark
        .map(placemark => {
            return placemark.LineString.map(lineString => {
                return lineString.coordinates[0].split(' ')
                    .map(coord => coord.split(',').map(Number))
                    .filter(coord => coord.length > 1)
                    .map(coord => geojson.push([coord[1], coord[0]]));
            })
        });

    // const geojson = kmlData.Folder[0].Placemark[0].LineString[0].coordinates[0].split(' ')
        // .map(coord => coord.split(',').map(Number))
        // .filter(coord => coord.length > 1)
        // .map(coord => [coord[1], coord[0]]);
    return geojson;
}

// const parseKMLData = (kmlData) => {
//     const doc = new dom().parseFromString(kmlData);
//     console.log(doc);

//     const coordsList = [];

//     const ns = { kml: 'http://www.opengis.net/kml/2.2' };
//     const nsResolver = xpath.createNSResolver(doc.Folder);
//     nsResolver.lookupNamespaceURI = prefix => ns[prefix] || null;

//     const nodes = xpath.select('//kml:Placemark/kml:LineString/kml:coordinates', doc, true, nsResolver);

//     for (let index = 0; index < nodes.length; index++) {
//         const coords = nodes[index].firstChild.data.trim().split(',');
//         coordsList.push([coords[1], coords[0]]);
//     }
// }