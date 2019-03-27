// Put all onload AJAX calls here, and event listeners
$(document).ready(function() {
    // On page-load AJAX Example
    /*$.ajax({
        type: 'get',            //Request type
        dataType: 'json',       //Data type - we will use JSON for almost everything 
        url: '/someendpoint',   //The server endpoint we are connecting to
        success: function (data) {
            $('#blah').html("On page load, Received string '"+JSON.stringify(data)+"' from server");
            //We write the object to the console to show that the request was successful
            console.log(data); 

        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log(error); 
        }
    });*/

    //Populate dropdown
    $.ajax({
        type: 'get',            //Request type
        dataType: 'json',       //Data type - we will use JSON for almost everything 
        url: '/populateDropDownValid',   //The server endpoint we are connecting to
        success: function (data) {
            $('#statusBox').html("\nLoaded '"+JSON.stringify(data)+"' from server");
            var list = data.listOfFiles;
            list.forEach(function(item) {
                var option = document.createElement('option');
                option.text = option.value = item;
                document.getElementById('viewFiles').add(option, 0);
            });
            var s = $('#viewFiles').children("option:selected").val();

            $.ajax({
                type: 'get',            //Request type
                dataType: 'json',       //Data type - we will use JSON for almost everything 
                url: '/populateCalView',   //The server endpoint we are connecting to
                data: {theFile: s},
                success: function (info) {
                    var list = info.listOfRows;
                    let f = JSON.parse(list);
                    var i = 1;
                    f.forEach(function(item) {
                        let table = document.getElementById('calViewTable');
                        let row = table.insertRow(i);

                        let cell = row.insertCell(0);
                        let value = document.createTextNode(i);
                        cell.appendChild(value);

                        let cell1 = row.insertCell(1);
                        let value1 = document.createTextNode(item.startDT.date.substring(0, 4) + '/' + item.startDT.date.substring(4, 6) + '/' + item.startDT.date.substring(6, 8));
                        cell1.appendChild(value1);

                        let cell2 = row.insertCell(2);
                        let str = item.startDT.time.substring(0, 2) + ':' + item.startDT.time.substring(2, 4) + ':' + item.startDT.time.substring(4, 6);
                        if (item.startDT.isUTC === true) {
                            str = str + ' (UTC)';
                        }
                        let value2 = document.createTextNode(str);
                        cell2.appendChild(value2);

                        let cell3 = row.insertCell(3);
                        let value3 = document.createTextNode(item.summary);
                        cell3.appendChild(value3);

                        let cell4 = row.insertCell(4);
                        let value4 = document.createTextNode(item.numProps);
                        cell4.appendChild(value4);

                        let cell5 = row.insertCell(5);
                        let value5 = document.createTextNode(item.numAlarms);
                        cell5.appendChild(value5);
                        i++;
                    });
                },
                fail: function(error) {
                    // Non-200 return, do something with error
                    console.log(error); 
                }
            });

        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log(error); 
        }
    });

    //Populate dropdown
    $.ajax({
        type: 'post',            //Request type
        url: '/populateDropDownValid',   //The server endpoint we are connecting to
        success: function (data) {
            console.log("success");

        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("inv file"); 
        }
    });
    //Populate dropdown
    $.ajax({
        type: 'get',            //Request type
        dataType: 'json',       //Data type - we will use JSON for almost everything 
        url: '/populateDropDownValid',   //The server endpoint we are connecting to
        success: function (data) {
            $('#statusBox').html("\nLoaded '"+JSON.stringify(data)+"' from server");
            var list = data.listOfFiles;
            list.forEach(function(item) {
                var option = document.createElement('option');
                option.text = option.value = item;
                document.getElementById('listOfFiles').add(option, 0);
            });

        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log(error); 
        }
    });

    $.ajax({
        type: 'get',            //Request type
        dataType: 'json',       //Data type - we will use JSON for almost everything 
        url: '/populateFileLog',   //The server endpoint we are connecting to
        success: function (data) {
            var list = data.listOfRows;
            var fileName = data.listOfFiles;
            let table = document.getElementById('fileLogTable');

            if (list.length === 0) {
                let row = table.insertRow(table.rows.length);
                let cell = row.insertCell(0);
                let value = document.createTextNode("No files");
                cell.appendChild(value);
            }
            let i = 1;
            list.forEach(function(item) {
                let obj = JSON.parse(item);

                if (obj.prodID == "Invalid file") {
                    $('#statusBox').append("<br/>Error: Could not parse file " + fileName[i - 1]);
                    i++;
                }
                else {
                    let row = table.insertRow(table.rows.length);
                    let cell = row.insertCell(0);
                    var string = [];
                    string.push('<a href = \"uploads/', escape(fileName[i - 1]), '\"">', escape(fileName[i - 1]), '</a>');
                    cell.innerHTML = string.join('');

                    let cell2 = row.insertCell(1);
                    let value2 = document.createTextNode(obj.version);
                    cell2.appendChild(value2);

                    let cell3 = row.insertCell(2);
                    let value3 = document.createTextNode(obj.prodID);
                    cell3.appendChild(value3);

                    let cell4 = row.insertCell(3);
                    let value4 = document.createTextNode(obj.numEvents);
                    cell4.appendChild(value4);

                    let cell5 = row.insertCell(4);
                    let value5 = document.createTextNode(obj.numProps);
                    cell5.appendChild(value5);
                    i++;
                }
            });


        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log(error); 
        }
    });


    //Update calViewTable when it changes
    $('#viewFiles').on('change', function() {
        var s = $('#viewFiles').children("option:selected").val();
        $.ajax({
            type: 'get',            //Request type
            dataType: 'json',       //Data type - we will use JSON for almost everything 
            url: '/populateCalView',   //The server endpoint we are connecting to
            data: {theFile: s},
            success: function (info) {
                var list = info.listOfRows;
                let f = JSON.parse(list);
                var i = 1;
                for(var j = document.getElementById('calViewTable').rows.length - 1; j > 0; j--)
                {
                    document.getElementById('calViewTable').deleteRow(j);
                }
                f.forEach(function(item) {
                    let table = document.getElementById('calViewTable');
                    let row = table.insertRow(i);

                    let cell = row.insertCell(0);
                    let value = document.createTextNode(i);
                    cell.appendChild(value);

                    let cell1 = row.insertCell(1);
                    let value1 = document.createTextNode(item.startDT.date.substring(0, 4) + '/' + item.startDT.date.substring(4, 6) + '/' + item.startDT.date.substring(6, 8));
                    cell1.appendChild(value1);

                    let cell2 = row.insertCell(2);
                    let str = item.startDT.time.substring(0, 2) + ':' + item.startDT.time.substring(2, 4) + ':' + item.startDT.time.substring(4, 6);
                    if (item.startDT.isUTC === true) {
                        str = str + ' (UTC)';
                    }
                    let value2 = document.createTextNode(str);
                    cell2.appendChild(value2);

                    let cell3 = row.insertCell(3);
                    let value3 = document.createTextNode(item.summary);
                    cell3.appendChild(value3);

                    let cell4 = row.insertCell(4);
                    let value4 = document.createTextNode(item.numProps);
                    cell4.appendChild(value4);

                    let cell5 = row.insertCell(5);
                    let value5 = document.createTextNode(item.numAlarms);
                    cell5.appendChild(value5);
                    i++;
                });
            },
            fail: function(error) {
                // Non-200 return, do something with error
                console.log(error); 
            }
        });
    });


    //Clear button
    document.getElementById('clearStatus').onclick = function() {
        $('#statusBox').html("");
    };

    //Show Alarms
    document.getElementById('showAlarms').onclick = function() {
        var eventToShow = prompt("Enter the Event Number you wish to see alarms for");
        if (eventToShow > 0 && eventToShow <= $('#calViewTable tr').length - 1) {
            var s = $('#viewFiles').children("option:selected").val();
            $.ajax({
                type: 'get',            //Request type
                url: '/showAllAlarms',   //The server endpoint we are connecting to
                data: {theFile: s, theEvent: eventToShow},
                success: function (info) {
                    var almStr = info.theString;
                    var evt = info.theEvt;
                    $('#statusBox').append("<br/>Displaying list of alarms for event " + evt + ":" + almStr);
                },
                fail: function(error) {
                    // Non-200 return, do something with error
                    console.log(error); 
                }
            });
        }
        else {
            $('#statusBox').append("<br/>Invalid event number when trying to view list of alarms");
        }
    };

    //Show Props
    document.getElementById('showProps').onclick = function() {
        var eventToShow = prompt("Enter the Event Number you wish to see alarms for");
        var s = $('#viewFiles').children("option:selected").val();
        if (eventToShow > 0 && eventToShow <= $('#calViewTable tr').length - 1) {
            $.ajax({
                type: 'get',            //Request type
                url: '/showAllProps',   //The server endpoint we are connecting to
                data: {theFile: s, theEvent: eventToShow},
                success: function (info) {
                    var evt = info.theEvt;
                    propStr = info.theString;
                    $('#statusBox').append("<br/>Displaying list of properties for event " +evt+":" + propStr);
                },
                fail: function(error) {
                    // Non-200 return, do something with error
                    console.log(error); 
                }
            });
        }
        else {
            $('#statusBox').append("<br/>Invalid event number when trying to view list of properties");
        }
    };

    $("#fileButton").click(function() {
        $(".fileLog").show();
        $(".calView").hide();
        $(".cCal").hide();
        $(".aEvent").hide();
        $(".database").hide();
    });

    $("#calButton").click(function() {
        $(".fileLog").hide();
        $(".calView").show();
        $(".cCal").hide();
        $(".aEvent").hide();
        $(".database").hide();
    });

    $("#cCalButton").click(function() {
        $(".fileLog").hide();
        $(".calView").hide();
        $(".cCal").show();
        $(".database").hide();
        $(".aEvent").hide();
    });

    $("#aEventButton").click(function() {
        $(".fileLog").hide();
        $(".calView").hide();
        $(".cCal").hide();
        $(".database").hide();
        $(".aEvent").show();
    });

    $("#dbButton").click(function() {
        $(".fileLog").hide();
        $(".calView").hide();
        $(".cCal").hide();
        $(".aEvent").hide();
        $(".database").show();
    });

    $("#dbLoginButton").click(function() {
        event.preventDefault();
        $.ajax({
            type: 'post',
            url: '/dbUserInfo',
            dataType: 'html',
            data: {username: $("#username").val(), pw: $("#pw").val(), dbName: $("#dbName").val()},
            success: function (data) {
                if (data == "good") {
                    $(".databaseOperations").show();
                }
                else if (data == "badCred") {
                    alert("Unable to connect to the database, please check credentials");
                }
                else if (data == "badSQL") {
                    alert("oopsie woopsie, mysql made a fucky wucky");
                }
            },
        });
    });

    // Event listener form replacement example, building a Single-Page-App, no redirects if possible
    /*$('#someform').submit(function(e){
        $('#blah').html("Callback from the form");
        e.preventDefault();
        //Pass data to the Ajax call, so it gets passed to the 
        $.ajax({});
    });*/
});