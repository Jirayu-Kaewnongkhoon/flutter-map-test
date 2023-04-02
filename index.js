const express = require('express');
const cors = require('cors');
const path = require('path');

const { parseKMLData } = require('./src/xpathKMZ');
const { uploadTile } = require('./src/uploadTile');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ตั้งค่าการเรียกใช้งานไฟล์ static
app.use(express.static(path.join(__dirname, 'public')));

app.get('/kmz', async (req, res) => {
    const filepath = path.join(__dirname, 'public', 'kmz', '20220517_ky_map_block13_flight1_kml.kmz');

    const data = await parseKMLData(filepath);
    res.send(data);
})

app.post('/tile', uploadTile);

// สร้างเส้นทางสำหรับการเรียกใช้งานแผนที่
// app.get('/', function(req, res) {
//     res.sendFile(path.join(__dirname + '/index.html'));
// });

// เปิดพอร์ตและเริ่มต้น Server
app.listen(3300, function() {
    console.log('Map Server started on port 3300...');
});