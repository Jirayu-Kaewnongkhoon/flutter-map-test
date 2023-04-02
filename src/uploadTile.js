const mapboxSDK = require('@mapbox/mapbox-sdk');
const mapboxUpload = require('@mapbox/mapbox-sdk/services/uploads');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const AdmZip = require('adm-zip');

const axios = require('axios');
const FormData = require('form-data')

const accessToken = 'pk.eyJ1Ijoibm9tZXJjaWlpIiwiYSI6ImNsZnkyYTUzbTBmbmYzaHBhZ3UwZWE2em4ifQ.4KXKSMBBg4UHQCRJ99kqBg';
const accountID = 'nomerciii';

const mapboxClient = mapboxSDK({ accessToken });
const uploadClient = mapboxUpload(mapboxClient);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        const fileName = generateFileName(file);
        cb(null, fileName)
    },
});

const uploadSingle = multer({ storage }).single('tile');

const dir = path.join(__dirname, '..', 'uploads');
const filename = 'ky_block_10_11-001.tif';
// const filename = '00b26192-9676-4e26-9de7-13013151b595.zip';
const filePath = `${dir}\\${filename}`; // ตั้งค่าเป็นไฟล์ที่ต้องการอัปโหลด

const fileSize = fs.statSync(filePath).size;

const chunkSize = 1024 * 1024 * 200; // 200 MB
const maxChunks = Math.ceil(fileSize / chunkSize);

const url = `https://api.mapbox.com/uploads/v1/${accountID}/credentials?access_token=${accessToken}`;

const uploadTile = async (req, res) => {

    // try {
    //     const response = await axios({
    //         method: 'post',
    //         url: `https://api.mapbox.com/uploads/v1/${accountID}/credentials?access_token=${accessToken}`,
    //     });
    //     console.log(response.data);
    // } catch (error) {
    //     console.log(error);
    // }

    // for (let i = 0; i < maxChunks; i++) {
    //     const start = i * chunkSize;
    //     const end = (i + 1) * chunkSize;
      
    //     const stream = fs.createReadStream(filePath, { start, end });

    //     stream.on('error', error => {
    //         console.log(error);
    //     });
      
    //     const config = {
    //         method: 'put',
    //         url: url,
    //         headers: {
    //             'Content-Type': 'application/octet-stream',
    //             'Content-Range': `bytes ${start}-${end - 1}/${fileSize}`,
    //             'Mapbox-Api-Token': accessToken
    //         },
    //         data: stream,
    //         timeout: 30000,
    //     };
      
    //     axios(config)
    //         .then(response => {
    //             console.log(response.data);
    //         })
    //         .catch(error => {
    //             console.log(error);
    //         });
    // }






    const file = fs.readFileSync(filePath);
    uploadClient.tilesets({
        account: accountID,
        file: file,
        name: filename,
        type: 'image/tiff',
    }, (err, response) => {
        if (err) throw err;
        
        res.send('done');
        console.log(response);
    });





    

    // uploadSingle(req, res, async (err) => {
    //     const dir = path.join(__dirname, '..', 'uploads');
        
    //     console.log(req.body);
    //     console.log(req.file);
        
    //     if (err) return console.log(err);

    //     const zipFilePath = `${dir}\\${req.file.filename}`;
    //     console.log(zipFilePath);
    //     const zip = new AdmZip(zipFilePath);
    //     const zipEntries = zip.getEntries();

    //     zipEntries.forEach(zipEntry => {
    //         console.log(zipEntry.toString());
    //         if (zipEntry.entryName.endsWith('.tif')) {
    //             // const tifData = zipEntry.getData();
    //             // console.log(tifData);
    //             uploadClient({
    //                 account: accountID,
    //                 file: zipEntry,
    //                 name: req.file.originalname,
    //                 type: 'image/tiff',
    //             }, (err, response) => {
    //                 if (err) throw err;
                    
    //                 res.send('done');
    //                 console.log(response);
    //             });
    //         }
    //     });
    // })
}

module.exports = {
    uploadTile,
}

const generateFileName = (file) => {
    const extension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${extension}`;
    return fileName;
}