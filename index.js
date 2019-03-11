/*let sharedLib = ffi.Library('./parser', {
    'createCalendar': ['string', ['string, ']]
    'deleteCalendar':
    'writeCalendar':
    'validateCalendar':
    'dtToJSON':
    'eventToJSON':
    'eventListToJSON':
    'calendarToJSON':
    'JSONtoCalendar':

});*/

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
        url: '/listFiles',   //The server endpoint we are connecting to
        success: function (data) {
            $('#statusBox').html("\nLoaded '"+JSON.stringify(data)+"' from server");
            var list = data.allFiles;
            list.forEach(function(item) {
                var option = document.createElement('option');
                option.text = option.value = item;
                document.getElementById('viewFiles').add(option, 0);
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
        url: '/listFiles',   //The server endpoint we are connecting to
        success: function (data) {
            var list = data.allFiles;
            let table = document.getElementById('fileLogTable');

            if (list.length === 0) {
                let row = table.insertRow(table.rows.length);
                let cell = row.insertCell(0);
                let value = document.createTextNode("No files");
                cell.appendChild(value);
            }
            list.forEach(function(item) {
                let row = table.insertRow(table.rows.length);
                let cell = row.insertCell(0);
                var string = [];
                string.push('<a href = \"uploads/', escape(item), '\"">', escape(item), '</a>');
                cell.innerHTML = string.join('');

                let cell2 = row.insertCell(1);
                let value2 = document.createTextNode("2");
                cell2.appendChild(value2);

                let cell3 = row.insertCell(2);
                let value3 = document.createTextNode("temp prodID");
                cell3.appendChild(value3);

                let cell4 = row.insertCell(3);
                let value4 = document.createTextNode(0);
                cell4.appendChild(value4);

                let cell5 = row.insertCell(4);
                let value5 = document.createTextNode(0);
                cell5.appendChild(value5);
            });

        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log(error); 
        }
    });
    //Populate the calView table initially
    $('#viewFiles').ready(function() {
        let table = document.getElementById('calViewTable');
        let row = table.insertRow(1);

        let cell = row.insertCell(0);
        let value = document.createTextNode("tempNo");
        cell.appendChild(value);

        let cell1 = row.insertCell(1);
        let value1 = document.createTextNode("tempDate");
        cell1.appendChild(value1);

        let cell2 = row.insertCell(2);
        let value2 = document.createTextNode("tempTime");
        cell2.appendChild(value2);

        let cell3 = row.insertCell(3);
        let value3 = document.createTextNode("tempSummary");
        cell3.appendChild(value3);

        let cell4 = row.insertCell(4);
        let value4 = document.createTextNode("0");
        cell4.appendChild(value4);

        let cell5 = row.insertCell(5);
        let value5 = document.createTextNode("0");
        cell5.appendChild(value5);

    });

    //Update calViewTable when it changes
    $('#viewFiles').on('change', function() {
        let table = document.getElementById('calViewTable');
        table.deleteRow(1);
        let row = table.insertRow(1);

        let cell = row.insertCell(0);
        let value = document.createTextNode("tempNo");
        cell.appendChild(value);

        let cell1 = row.insertCell(1);
        let value1 = document.createTextNode("tempDate");
        cell1.appendChild(value1);

        let cell2 = row.insertCell(2);
        let value2 = document.createTextNode("tempTime");
        cell2.appendChild(value2);

        let cell3 = row.insertCell(3);
        let value3 = document.createTextNode("tempSummary");
        cell3.appendChild(value3);

        let cell4 = row.insertCell(4);
        let value4 = document.createTextNode("0");
        cell4.appendChild(value4);

        let cell5 = row.insertCell(5);
        let value5 = document.createTextNode("0");
        cell5.appendChild(value5);

    });


    //Clear button
    document.getElementById('clearStatus').onclick = function() {
        $('#statusBox').html("");
    };

    //Upload File
    document.getElementById('uploadFile').onclick = function() {
        $('#fileDialog').click();
        $('#uploadForm').submit(function(e) {
            e.preventDefault();
            var formData = new FormData(this);
            $.ajax({
                url: window.location.pathname,
                type: 'POST',
                data: formData, 
                success: function (data) {
                    $('#statusBox').append("<br>Uploaded file to server");
                    console.log(data);
                },
                fail: function(error) {
                    // Non-200 return, do something with error
                    console.log(error); 
                },
                cache: false,
                contentType: false,
                processData: false
            });
        });
    };

    //Show Show Alarms
    document.getElementById('showAlarms').onclick = function() {
        var eventToShow = prompt("Enter the Event Number you wish to see alarms for");
        $('#statusBox').append("<br/>Displaying event number " +eventToShow+":");
    };

    //Show Props
    document.getElementById('showProps').onclick = function() {
        var propsToShow = prompt("Enter the Event Number you wish to see properties for");
        $('#statusBox').append("<br/>Displaying event number " +propsToShow+":");
    };

    //Create Calendar
    document.getElementById('createCal').onclick = function() {
        document.getElementById('statusPanel').innerHTML = "Nothing Here Yet";
    };

    //Create Event
    document.getElementById('createEvent').onclick = function() {
        document.getElementById('statusPanel').innerHTML = "Nothing Here Yet";
    };

    // Event listener form replacement example, building a Single-Page-App, no redirects if possible
    /*$('#someform').submit(function(e){
        $('#blah').html("Callback from the form");
        e.preventDefault();
        //Pass data to the Ajax call, so it gets passed to the 
        $.ajax({});
    });*/
});