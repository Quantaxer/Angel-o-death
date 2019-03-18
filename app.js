'use strict'

// C library API
const ffi = require('ffi');

// Express App (Routes)
const express = require("express");
const app     = express();
const path    = require("path");
const fileUpload = require('express-fileupload');

app.use(fileUpload());

// Minimization
const fs = require('fs-extra');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Important, pass in port as in `npm run dev 1234`, do not change
const portNum = process.argv[2];

// Send HTML at root, do not change
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

// Send Style, do not change
app.get('/style.css',function(req,res){
  //Feel free to change the contents of style.css to prettify your Web app
  res.sendFile(path.join(__dirname+'/public/style.css'));
});

// Send obfuscated JS, do not change
app.get('/index.js',function(req,res){
  fs.readFile(path.join(__dirname+'/public/index.js'), 'utf8', function(err, contents) {
    const minimizedContents = JavaScriptObfuscator.obfuscate(contents, {compact: true, controlFlowFlattening: true});
    res.contentType('application/javascript');
    res.send(minimizedContents._obfuscatedCode);
  });
});

//Respond to POST requests that upload files to uploads/ directory
app.post('/upload', function(req, res) {
  if(!req.files) {
    return res.status(400).send('No files were uploaded.');
  }
 
  let uploadFile = req.files.fileboi;
 
  // Use the mv() method to place the file somewhere on your server
  uploadFile.mv('uploads/' + uploadFile.name, function(err) {
    if(err) {
      return res.status(500).send(err);
    }

    res.redirect('/');
  });
});

//Respond to GET requests for files in the uploads/ directory
app.get('/uploads/:name', function(req , res){
  fs.stat('uploads/' + req.params.name, function(err, stat) {
    console.log(err);
    if(err == null) {
      res.sendFile(path.join(__dirname+'/uploads/' + req.params.name));
    } else {
      res.send('');
    }
  });
});

//******************** Your code goes here ******************** 

//Sample endpoint
/*app.get('/someendpoint', function(req , res){
  res.send({
    foo: "bar"
  });
});*/

app.get('/listFiles', function(req, res) {
    fs.readdir('./uploads', (err, files) => {
        res.send({allFiles:files});
    });
});

//Creates a new calendar
app.get('/newCal', function(req, res) {
  const ver = req.query.version;
  const prodID = req.query.prodID;
  const filename = req.query.fileName;

  const uid = req.query.uid;
  const start = req.query.start;
  const creation = req.query.creation;
  const summary = req.query.summary;
});

//Creates a new event
app.get('/newEvt', function(req, res) {
  const file = req.files.currentFile;
  const uid = req.query.uid;
  const start = req.query.start;
  const creation = req.query.creation;
  const summary = req.query.summary;
});

app.listen(portNum);
console.log('Running app at localhost: ' + portNum);


let sharedLib = ffi.Library('./libcal', {
  'calViewPanelRow': ['string', ['string']],
  'filePanelRow': ['string', ['string']],
  'validateCalFile': ['string', ['string']],
  'displayAlarms': ['string', ['string', 'int']],
  'displayProps': ['string', ['string', 'int']],
  'createNewCalFile': ['string', ['string', 'int', 'string', 'string', 'string', 'string', 'string', 'string', 'string']],
  'addEvtToCal': ['string', ['string', 'string', 'string', 'string', 'string', 'string', 'string']],
});

app.get('/populateFileLog', function(req, res) {
    var json = [];
    fs.readdir('./uploads', (err, files) => {
        files.forEach(function(item) {
            let x = sharedLib.filePanelRow('uploads/' + item);
            json.push(x);
        });
        res.send({listOfRows:json,
            listOfFiles:files
        });
    });
});

app.get('/populateCalView', function(req, res) {
    let valid = sharedLib.validateCalFile('uploads/' + req.query.theFile);
    if (valid == "OK") {
        var x = sharedLib.calViewPanelRow('uploads/' +  req.query.theFile);
        res.send({listOfRows:x
    });
    }
});

app.get('/populateDropDownValid', function(req, res) {
    var json = [];
    fs.readdir('./uploads', (err, files) => {
        files.forEach(function(item) {
            let x = sharedLib.validateCalFile('uploads/' + item);
            if (x == "OK") {
              json.push(item);
            }
        });
        res.send({listOfFiles:json,
        });
    });
});

app.get('/validateFileUpload', function(req, res) {
  let uploadFile = req.theFile;
  let valid = sharedLib.validateCalFile(uploadFile);
  if (valid == "OK") {
      return res.send({isValid: true});
  }
  else {
    return res.send({isValid: false});
  }
});

app.get('/showAllProps', function(req, res) {
  let eventNo = req.query.theEvent;
  let fileName = req.query.theFile;
  let prop = sharedLib.displayProps('uploads/' + fileName, eventNo);
  res.send({theString: prop, theEvt: eventNo});
});

app.get('/showAllAlarms', function(req, res) {
  let eventNo = req.query.theEvent;
  let fileName = req.query.theFile;
  let alm = sharedLib.displayAlarms('uploads/' + fileName, eventNo);
  res.send({theString: alm, theEvt: eventNo});
});

var bodyParse = require('body-parser');
app.use(bodyParse.urlencoded({extended: true}));

app.post('/newCal', function(req, res) {
	var ver = req.body.version;
	var prod = req.body.prodID;
	var fileName = req.body.fileName;
	var uid = req.body.uid;
	var startDate = req.body.start;
	var creationDate = req.body.creation;
	var sum = req.body.summary;

	var extensionCheck = fileName.split('.').pop();

	if (extensionCheck != "ics") {
		return res.status(500).send("Invalid file extension");
	}

	if (!fs.existsSync('uploads/' + fileName)) {
		if (startDate.length == 15 || startDate.length == 16) {
			if (!isNaN(startDate.substring(0,8)) && !isNaN(startDate.substring(9,15))) {
				if (creationDate.length == 15 || creationDate.length == 16) {
					if (!isNaN(creationDate.substring(0,8)) && !isNaN(creationDate.substring(9,15))) {
						var s = sharedLib.createNewCalFile('uploads/' + fileName, ver, prod, uid, startDate.substring(0,8), startDate.substring(9,15), creationDate.substring(0,8), creationDate.substring(9,15), sum);
						res.redirect('/');
					}
					else {
						return res.status(500).send("Invalid file");
					}
				}
				else {
					return res.status(500).send("Invalid file");
				}
			}
			else {
				return res.status(500).send("Invalid file");
			}
		}
		else {
			return res.status(500).send("Invalid file");
		}
	}
	else {
      	return res.status(500).send("File name already exists in the server");
	}
});

app.post('/newEvt', function(req, res) {
	var uid = req.body.uid;
	var startDate = req.body.start;
	var creationDate = req.body.creation;
	var sum = req.body.summary;
	var fileName = req.body.currentFile;

	if (startDate.length == 15 || startDate.length == 16) {
		if (!isNaN(startDate.substring(0,8)) && !isNaN(startDate.substring(9,15))) {
			if (creationDate.length == 15 || creationDate.length == 16) {
				if (!isNaN(creationDate.substring(0,8)) && !isNaN(creationDate.substring(9,15))) {
					var s = sharedLib.addEvtToCal('uploads/' + fileName, uid, startDate.substring(0,8), startDate.substring(9,15), creationDate.substring(0,8), creationDate.substring(9,15), sum);
					res.redirect('/');
				}
				else {
					return res.status(500).send("Invalid file");
				}
			}
			else {
				return res.status(500).send("Invalid file");
			}
		}
		else {
			return res.status(500).send("Invalid file");
		}
	}
	else {
		return res.status(500).send("Invalid file");
	}
});