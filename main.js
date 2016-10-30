const fs    = require('fs');
const express = require('express');
const yaml    = require('js-yaml');
const request = require('request');
const bodyParser = require('body-parser');
const basicAuth = require('basic-auth-connect');

const app = express();


//// Constants.

const CONFIG_FILE = "config.yaml";	// Path to the config file
const DEBUG = true;			// Debug mode flag.


//// Global variables.

var _config_ = false;


////

function isSuccess(response) {
    return response.statusCode == 200;
}


////

function getPower(data) {
    return (data["Power"] == "Off") ? "Выключено" : data["Power"] + " в";
}

function getTemp(data) {
    return (data["Temp"] == "NotValid") ? "N/A" : data["Temp"] + " C";
}

function getBalance(data) {
    return (data["Balance"] == "NotValid") ? "N/A" : data["Balance"];
}

function getBattery(data) {
    return (data["Battery"]["State"] == "NotUsed")
        ? "Не используется"
        : data["Battery"]["State"];
}

function renderIndex(res, eventsData) {
    var info = JSON.parse(eventsData);
    res.render('index', {
        inputs: info["Inputs"],
        outputs: info["Outputs"],
        temp: getTemp(info),
        power: getPower(info),
        batteryState: getBattery(info),
        partitions: info["Partitions"],
        balance: getBalance(info)
    });
}

function renderInfo(res, data) {
    var deviceInfo = JSON.parse(data);
    res.render('info', {
        deviceType:    deviceInfo["DeviceType"],
        deviceMod:     deviceInfo["DeviceMod"],
        hwVer:         deviceInfo["HwVer"],
        fwVer:         deviceInfo["FwVer"],
        bootVer:       deviceInfo["BootVer"],
        fwBuildDate:   deviceInfo["FwBuildDate"],
        countryCode:   deviceInfo["CountryCode"],
        serial:        deviceInfo["Serial"],
        IMEI:          deviceInfo["IMEI"],
        uGuardVerCode: deviceInfo["uGuardVerCode"]
    });
}


function handleGetRoot(req, res) {
    try {
        var body = '';

        // DEBUG:
        // var dataReq = request.get('http://localhost:8081/')

        var dataReq = request.get(_config_.ccush.server
                                  + 'data.cgx?cmd={"Command":"GetStateAndEvents"}')
            .auth(_config_.ccush.user, _config_.ccush.password);

        dataReq.on('error', function(e) {
            res.render('error');
        });

        dataReq.on('response', function(response) {
            console.log("Response status code: " + response.statusCode);
            if (response.statusCode == 200) {
                dataReq.on('data', function(chunk) {
                    body += chunk;
                });
                dataReq.on('end', function(error) {
                    if (! error)
                        renderIndex(res, body);
                    else
                        res.render('error');
                });
            } else {
                res.render('error');
            }
        });
    } catch (e) {
        console.log(e);
    }
}

function handleGetInfo(req, res) {
    var body = '';
    var dataReq = request.get(_config_.ccush.server
                              + 'data.cgx?cmd={"Command":"GetDeviceInfo"}')
        .auth(_config_.ccush.user, _config_.ccush.password);

    dataReq.on('error', function(e) {
        res.render('error');
    });
    dataReq.on('response', function(response) {
        console.log("Response status code: " + response.statusCode);
        if (response.statusCode == 200) {
            dataReq.on('data', function(chunk) {
                body += chunk;
            });
            dataReq.on('end', function(error) {
                renderInfo(res, body);
            });
        } else {
            res.render('error');
        }
    });
}

function handlePostEnableOutput(req, res) {
    console.log('handlePostEnableOutput: id: ' + req.body.id);
    request.get(_config_.ccush.server
                + 'data.cgx?cmd={"Command":"SetOutputState","Number":"'
                + req.body.id,
                + '","State":"1"}')
        .auth(_config_.ccush.user, _config_.ccush.password)
        .on('response', function(response) {
            console.log("Response status code: " + response.statusCode);
        });
    res.redirect('/');
}

function handlePostDisableOutput(req, res) {
    console.log('handlePostDisableOutput: id: ' + req.body.id);
    request.get(_config_.ccush.server
                + 'data.cgx?cmd={"Command":"SetOutputState","Number":"'
                + req.body.id,
                + '","State":"0"}')
        .auth(_config_.ccush.user, _config_.ccush.password)
        .on('response', function(response) {
            console.log("Response status code: " + response.statusCode);
        });
    res.redirect('/');
}


////

function setupApplication() {
    app.set('port', process.env.PORT || 8080);
    app.set('view engine', 'pug');
    app.set(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(express.static('public'));

    // Authenticator
    app.use(basicAuth('user', _config_.ccush_ui.password));
}

function setupRoutes() {
    app.get('/', handleGetRoot);
    app.get('/info', handleGetInfo);
    app.post('/enable-output', handlePostEnableOutput);
    app.post('/disable-output', handlePostDisableOutput);
}

// Read a configuration FILE, return a config object.
function readConfig(file) {
    return yaml.safeLoad(fs.readFileSync(file, 'utf8'));
}


////

// Entry point.
function main() {
    setupApplication();
    setupRoutes();

    _config_ = readConfig(CONFIG_FILE);

    var server = app.listen(8080, function() {
        console.log("Listening on port %d", server.address().port);
    });
}

main();

//// main.js ends here.
