// Global variables
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const app = express();
const readChunk = require('read-chunk');
const port = process.env.PORT || 5000;
const urlencodedParser = bodyParser.urlencoded({ extended: true });

app.set('view engine', 'ejs');
app.use('/assets', express.static('stuff'));

// Computing the number of bytes in the file
var fileSize = (filePath) => {

    let fileStat = fs.statSync(filePath);
    return fileStat.size;
}

var fileSearch = (filePath, searchString) => {
    let i = 0;
    let size = fileSize(filePath);
    let chunkSize = 1000;
    let prevChunk = '', currChunk = '';
    
    /* Reading chunks from the file and searching for the search string */ 
    while(size > 0){
        
        if(size > chunkSize){
            
            currChunk = readChunk.sync(filePath, i, chunkSize);
        }
        else{
            
            currChunk = readChunk.sync(filePath, i, size);
        }
        currChunk = currChunk.toString()

        chunk = prevChunk + currChunk;

        if(chunk.includes(searchString)){
            /* The search string is found */
            return 1;
        }

        i += chunkSize;
        size -= chunkSize;
        prevChunk = currChunk;
    }
    /* The search string is not found */
    return 0;
} 

// Handling GET request
app.get('/search', function(req, res){
    res.render('search', {qs: req.query});
}); 

// Handling POST request
app.post('/search',urlencodedParser, function (req, res) {
    
    // Variables
    let data = req.body;
    let status = '';
    let fileName = data.Name + '.txt'; 
    
    // Validation of the data
    if(data.Name !== '' && data.String !== '')
    {
        try{
            // Dummy read for checking for the existence of the given file name 
            readChunk.sync(fileName, 0, 1);
            if(fileSearch(fileName, data.String)){
                // String is found in the file
                status = '1';
            }
            else{
                // String not found in the file 
                status = '2';
            }
        }
        catch{
            // File not found            
            status = '0';
        }
    }
    else{
        // Data not complete
        status = '3';
    }
    res.send(status);
});

// Listen to a port
app.listen(port);