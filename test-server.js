const express = require('express');

const app = express();

function setupRoutes() {
    app.get('/', function(req, res) {
        res.set('Content-Type', 'application/json');
        res.send('{"Inputs":[{"Active":0,"Voltage":2101},{"Active":1,"Voltage":3},{"Active":0,"Voltage":0},{"Active":0,"Voltage":65},{"Active":0,"Voltage":0},{"Active":0,"Voltage":36},{"Active":0,"Voltage":0},{"Active":0,"Voltage":0}],"Outputs":[0,0,0,0,0,0,0],"Partitions":["Disarm"],"Battery":{"State":"NotUsed"},"Case":1,"Power":15.2,"Temp":27,"Balance":242.8}');
    });

    app.get('/info', function(req, res) {
        res.set('Content-Type', 'application/json');
        res.send({
            DeviceType: "CCU825",
            DeviceMod: "H-DROID",
            HwVer:      "10.02",
            FwVer:      "02.02",
            BootVer:    "01.02",
            FwBuildDate:    "Aug 31 2015",
            CountryCode:    "RUS",
            Serial:    "123445677",
            IMEI:    "1231423125",
            uGuardVerCode: "17"
        });
    });
}

// Entry point.
function main() {
    setupRoutes();

    var server = app.listen(8081, function() {
        console.log("Listening on port %d", server.address().port);
    });
}

main();
