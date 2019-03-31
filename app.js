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
  'displayPropsJSON': ['string', ['string', 'int']],
  'displayAlmsJSON': ['string', ['string', 'int']],

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

const mysql = require('mysql');
var userN;
var pass;
var name;


app.post('/dbUserInfo', function(req, res) {
	userN = req.body.username;
	pass = req.body.pw;
	name = req.body.dbName;
	var isErr;
	const connection = mysql.createConnection({
		host: 'dursley.socs.uoguelph.ca',
		user: userN,
		password: pass,
		database: name
	});
	connection.connect(function(err) {
		if (err) {
			isErr = "badCreds";
		}
		else {
			connection.query("create table if not exists FILE (cal_id int auto_increment primary key, file_Name varchar(60) not null, version int not null, prod_id varchar(256) not null )", function(err, rows, fields) {
				if (err) {
					isErr = "badSQL";
				}
			});

			connection.query("CREATE TABLE IF NOT EXISTS EVENT (event_id int auto_increment primary key, summary varchar(1024), start_time datetime not null, location varchar(60), organizer varchar(256), cal_file int not null, FOREIGN KEY(cal_file) REFERENCES FILE(cal_id) ON DELETE CASCADE )", function(err, rows, fields) {
				if (err) {
					isErr = "badSQL";
				}
			});

			connection.query("create table if not exists ALARM (alarm_id int auto_increment primary key, action varchar(256) not null, `trigger` varchar(256) not null, event int not null, FOREIGN KEY(event) REFERENCES EVENT(event_id) ON DELETE CASCADE)", function(err, rows, fields) {
				if (err) {
					isErr = "badSQL";
				}
			});
			isErr = "good";
		}
		if (isErr == "good") {
			res.send("good");
		}
		else if (isErr == "badCreds") {
			res.send("badCred");
		}
		else if (isErr == "badSQL"){
			res.send("badSQL");
		}
	});
});

app.get('/dbStatus', function(req, res) {
	var n1;
	var n2;
	var n3;
	const connection = mysql.createConnection({
		host: 'dursley.socs.uoguelph.ca',
		user: userN,
		password: pass,
		database: name
	});
	connection.connect(function(err) {
		if (err) {
			console.log("fuck");
		}
		else {
			connection.query("select count(*) as total from FILE", function(err, results) {
				if (err) {
					console.log("oops");
				}
				else {
					n1 = results[0].total;
					connection.query("select count(*) as total from EVENT", function(err, results) {
						if (err) {
							console.log("oops");
						}
						else {
							n2 = results[0].total;
							connection.query("select count(*) as total from ALARM", function(err, results) {
								if (err) {
									console.log("oops");
								}
								else {
									n3 = results[0].total;
									res.send({N1:n1,N2:n2,N3:n3});
								}
							});
						}
					});
				}
			});
			
		}
	});
});

app.get('/dbClear', function(req, res) {
	const connection = mysql.createConnection({
		host: 'dursley.socs.uoguelph.ca',
		user: userN,
		password: pass,
		database: name
	});

	connection.connect();

	connection.query("delete from FILE", function(err, results) {
		if (err) {
			console.log("oops");
		}
		else {
			res.send("good");
		}
	});
	connection.end();
});

app.get('/query1', function(req, res) {
	const connection = mysql.createConnection({
		host: 'dursley.socs.uoguelph.ca',
		user: userN,
		password: pass,
		database: name
	});
	connection.connect();

	connection.query("select event_id, summary, start_time, location, organizer, cal_file from EVENT order by start_time", function(err, results) {
		if (err) {
			console.log("HECK");
		}
		else {
			res.send(results);
		}
	});

	connection.end();
});

app.get('/query2', function(req, res) {
	const connection = mysql.createConnection({
		host: 'dursley.socs.uoguelph.ca',
		user: userN,
		password: pass,
		database: name
	});
	connection.connect();

	var userInput = req.query.input;
	connection.query("select start_time, summary from FILE, EVENT where (FILE.cal_id = EVENT.cal_file and file_Name = '" + userInput +"') order by start_time", function(err, results) {
		if (err) {
			console.log("yeet");
		}
		else {
			res.send(results);
		}
	});

	connection.end();
});

app.get('/query3', function(req, res) {
	const connection = mysql.createConnection({
		host: 'dursley.socs.uoguelph.ca',
		user: userN,
		password: pass,
		database: name
	});
	connection.connect();

	var userInput = req.query.input;
	connection.query("select start_time, summary, organizer from EVENT group by start_time having COUNT(start_time) > 1", function(err, results) {
		if (err) {
			console.log("yeet");
		}
		else {
			res.send(results);
		}
	});

	connection.end();
});

app.get('/checkIfExists', function(req, res) {
	const connection = mysql.createConnection({
		host: 'dursley.socs.uoguelph.ca',
		user: userN,
		password: pass,
		database: name
	});
	connection.connect();
	var userInput = req.query.input;
	connection.query("select * from FILE where (file_Name = '" + userInput + "')", function(err, results) {
		if (err) {
			console.log("yes");
		}
		else {
			if (results.length == 0) {
				res.send({val: results, err: "bad"});
			}
			else {
				res.send({val: results, err: "good"});
			}
		}
	});
	connection.end();
})

app.get('/query4', function(req, res) {
	const connection = mysql.createConnection({
		host: 'dursley.socs.uoguelph.ca',
		user: userN,
		password: pass,
		database: name
	});
	connection.connect();

	var userInput = req.query.input;
	connection.query("select file_Name, action, `trigger` from EVENT, FILE, ALARM where (ALARM.event = EVENT.event_id and EVENT.cal_file = FILE.cal_id and FILE.file_Name = '" + userInput + "')", function(err, results) {
		if (err) {
			console.log("yeet");
		}
		else {
			return res.send({val:results, err:"good"});
		}
	});

	connection.end();
});

app.get('/query5', function(req, res) {
	const connection = mysql.createConnection({
		host: 'dursley.socs.uoguelph.ca',
		user: userN,
		password: pass,
		database: name
	});
	connection.connect();

	var userInput = req.query.input;
	connection.query("select file_Name, version, prod_id from EVENT, FILE having COUNT(cal_file) > 1", function(err, results) {
		if (err) {
			console.log("yeet");
		}
		else {
			res.send(results);
		}
	});

	connection.end();
});

app.get('/query6', function(req, res) {
	const connection = mysql.createConnection({
		host: 'dursley.socs.uoguelph.ca',
		user: userN,
		password: pass,
		database: name
	});
	connection.connect();

	var userInput = req.query.input;
	connection.query("select file_Name, summary, location, organizer from FILE, EVENT where (EVENT.location != 'null' and EVENT.organizer != 'null' and cal_id = cal_file)", function(err, results) {
		if (err) {
			console.log("yeet");
		}
		else {
			res.send(results);
		}
	});

	connection.end();
});

app.get('/sendToServer', function(req, res) {
	var listOf = req.query.list;
	
	const connection = mysql.createConnection({
		host: 'dursley.socs.uoguelph.ca',
		user: userN,
		password: pass,
		database: name
	});
	connection.connect(function(err) {
		var arr = [];
		listOf.forEach(function(item) {
			connection.query("select cal_id from FILE where file_Name = '" + item + "'", function(err, rows, fields) {
				if (err) {
					console.log("oooof");
				}
				else {
					var count = 0;
					if (rows[0] == null) {
						let x = sharedLib.filePanelRow('uploads/' + item);
						var temp = JSON.parse(x);
						connection.query("INSERT INTO FILE (file_Name, version, prod_id) VALUES ('" + item + "'," + temp.version + ",'" + temp.prodID + "')", function(err, rows, fields) {
							if (err) {
								console.log(err);
							}
							else {
								var y = sharedLib.calViewPanelRow('uploads/' +  item);
								var temp2 = JSON.parse(y);
								var i = 1;
								var j = 1;
								temp2.forEach(function(item2) {
									var tempprops = sharedLib.displayPropsJSON('uploads/' + item, i);
                                    var props = JSON.parse(tempprops);
									i++;
                                    connection.query("select cal_id as total from FILE where file_Name = '" + item + "'", function(err, results) {
                                        if (err) {
                                            console.log("ayylmao");
                                        }
                                        else {
                                            var cal = results[0].total;
                                            var id = 1;
                                            if (props.LOCATION == undefined) {
                                            	props.LOCATION = null;
                                            }
                                            if (props.ORGANIZER == undefined) {
                                            	props.ORGANIZER = null;
                                            } 
                                            if (item2.summary == undefined) {
                                            	item2.summary = null;
                                            }
                                            connection.query("insert into EVENT (summary, start_time, location, organizer, cal_file) values ('" + item2.summary + "', '" +  item2.startDT.date + item2.startDT.time + "', '" + props.LOCATION + "','" + props.ORGANIZER + "'," + cal + ")", function(err, results) {
                                                if (err) {
                                                    console.log("oops2");
                                                }
                                                else {
                                                    var tempalms = sharedLib.displayAlmsJSON('uploads/' + item, j);
                                                    var alms = JSON.parse(tempalms);
                                                    j++;
                                                    if (alms.length > 0) {
                                                    	var count = 0;
	                                                    connection.query("select event_id as total2 from EVENT where cal_file = '" + cal + "'", function(err, rows2, fields) {
	                                                        if (err) {
	                                                            console.log("biggest oof");
	                                                        }
	                                                        
	                                                        else {
	                                                        	var a = 1;
	                                                        	rows2.forEach(function(val) {
	                                                        		if (arr.indexOf(val.total2) == -1) {
		                                                        		 var t = sharedLib.displayAlmsJSON('uploads/' + item, a);
                                   										 var t2 = JSON.parse(t);
	                                                        				t2.forEach(function(item3) {
	                                                        					connection.query("insert into ALARM (action, `trigger`, event) values ('" + item3.ACTION + "','"+ item3.TRIGGER + "'," + val.total2 + ") ", function(err, results) {
				                                                        			if (err) {
				                                                        			console.log(err);
				                                                        			}
				                                                        		});
	                                                        				});
		                                                        		arr.push(val.total2);
	                                                        		}
	                                                        		a++;
		                                                        });
	                                                        	
	                                                        }
	                                                    });
	                                                }
                                                }
                                            });
                                        }
                                    });
								});
							}
						});
					}
				}
			});
		});
	});
	res.send({err:"idk"});
});