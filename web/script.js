const servicesAvailable = [
    'CarbonDioxideSensor',
    'CarbonMonoxideSensor',
    'ContactSensor',
    'Door',
    'Doorbell',
    'Fan',
    'GarageDoorOpener',
    'HumiditySensor',
    'LeakSensor',
    'LightSensor',
    'Lightbulb',
    'LockMechanism',
    'Microphone',
    'MotionSensor',
    'OccupancySensor',
    'Outlet',
    'SecuritySystem',
    'SmokeSensor',
    'Speaker',
    'StatelessProgrammableSwitch',
    'Switch',
    'TemperatureSensor',
    'Thermostat',
    'Window',
    'WindowCovering'
];

const Service = {
    "CarbonDioxideSensor": {
        "topic": [
            {
                "name": "statusCarbonDioxideDetected"
            },
            {
                "name": "statusLowBattery"
            },
            {
                "name": "identify"
            }
        ],
        "payload": [
            {
                "name": "onCarbonDioxideDetected"
            },
            {
                "name": "onLowBattery"
            },
            {
                "name": "identify"
            }
        ]
    },
    "CarbonMonoxideSensor": {
        "topic": [
            {
                "name": "statusCarbonMonoxideDetected"
            },
            {
                "name": "statusLowBattery"
            },
            {
                "name": "identify"
            }
        ],
        "payload": [
            {
                "name": "onCarbonMonoxideDetected"
            },
            {
                "name": "onLowBattery"
            },
            {
                "name": "identify"
            }
        ]
    },
    "ContactSensor": {
        "topic": [
            {"name": "statusContactSensorState"},
            {"name": "statusLowBattery"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "onContactDetected"},
            {"name": "onLowBattery"},
            {"name": "identify"}
        ]
    },
    "Door": {
        "topic": [
            {"name": "setTargetPosition"},
            {"name": "statusTargetPosition"},
            {"name": "statusCurrentPosition"},
            {"name": "statusPositionState"},
            {"name": "statusObstruction"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "targetPositionFactor", "type": "Number"},
            {"name": "currentPositionFactor", "type": "Number"},
            {"name": "positionStatusDecreasing"},
            {"name": "positionStatusIncreasing"},
            {"name": "onObstructionDetected"},
            {"name": "identify"}
        ]
    },
    "Doorbell": {
        "topic": [
            {
                "name": "statusEvent"
            },
            {
                "name": "identify"
            }
        ],
        "payload": [
            {
                "name": "identify"
            }
        ]
    },
    "Fan": {
        "topic": [
            {"name": "setOn"},
            {"name": "statusOn"},
            {"name": "setRotationDirection"},
            {"name": "statusRotationDirection"},
            {"name": "setRotationSpeed"},
            {"name": "statusRotationSpeed"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "onTrue"},
            {"name": "onFalse"},
            {"name": "rotationDirectionCounterClockwise"},
            {"name": "rotationDirectionClockwise"},
            {"name": "rotationSpeedFactor", "type": "Number"},
            {"name": "identify"}
        ]
    },
    "GarageDoorOpener": {
        "topic": [
            {"name": "setDoor"},
            {"name": "statusDoor"},
            {"name": "statusObstruction"},
            {"name": "setLock"},
            {"name": "statusLock"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "doorOpen"},
            {"name": "doorClosed"},
            {"name": "doorOpening"},
            {"name": "doorClosing"},
            {"name": "doorStopped"},
            {"name": "onObstructionDetected"},
            {"name": "lockUnsecured"},
            {"name": "lockSecured"},
            {"name": "identify"}
        ]
    },
    "HumiditySensor": {
        "topic": [
            {"name": "statusHumidity"},
            {"name": "statusLowBattery"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "onLowBattery"},
            {"name": "identify"}
        ]
    },
    "LeakSensor": {
        "topic": [
            {"name": "statusLeakDetected"},
            {"name": "statusLowBattery"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "onLeakDetected"},
            {"name": "onLowBattery"},
            {"name": "identify"}
        ]
    },
    "Lightbulb": {
        "topic": [
            {
                "name": "setOn"
            },
            {
                "name": "statusOn"
            },
            {
                "name": "setBrightness"
            },
            {
                "name": "statusBrightness"
            },
            {
                "name": "setHue"
            },
            {
                "name": "statusHue"
            },
            {
                "name": "setSaturation"
            },
            {
                "name": "statusSaturation"
            },
            {
                "name": "identify"
            },
        ],
        "payload": [
            {
                "name": "onTrue"
            },
            {
                "name": "onFalse"
            },
            {
                "name": "brightnessFactor",
                "type": "Number"
            },
            {
                "name": "hueFactor",
                "type": "Number"
            },
            {
                "name": "saturationFactor",
                "type": "Number"
            },

            {
                "name": "identify"
            },
        ]
    },
    "LightSensor": {
        "topic": [
            {"name": "statusAmbientLightLevel"},
            {"name": "statusLowBattery"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "ambientLightLevelFactor"},
            {"name": "onLowBattery"},
            {"name": "identify"}
        ]
    },
    "LockMechanism": {
        "topic": [
            {"name": "setLock"},
            {"name": "statusLock"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "lockSecured"},
            {"name": "identify"}
        ]
    },
    "Microphone": {
        "topic": [
            {"name": "setMute"},
            {"name": "statusMute"},
            {"name": "setVolume"},
            {"name": "statusVolume"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "muteTrue"},
            {"name": "muteFalse"},
            {"name": "volumeFactor", "type": "Number"},
            {"name": "identify"}
        ]
    },
    "MotionSensor": {
        "topic": [
            {"name": "statusMotionDetected"},
            {"name": "statusLowBattery"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "onMotionDetected"},
            {"name": "onLowBattery"},
            {"name": "identify"}
        ]
    },
    "OccupancySensor": {
        "topic": [
            {"name": "statusOccupancyDetected"},
            {"name": "statusLowBattery"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "onOccupancyDetected"},
            {"name": "onLowBattery"},
            {"name": "identify"}
        ]
    },
    "Outlet": {
        "topic": [
            {"name": "setOn"},
            {"name": "statusOn"},
            {"name": "statusOutletInUse"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "onFalse"},
            {"name": "onTrue"},
            {"name": "onOutletInUse"},
            {"name": "identify"}
        ]
    },
    "SecuritySystem": {
        "topic": [
            {"name": "setSecuritySystemTargetState"},
            {"name": "statusSecuritySystemCurrentState"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "identify"}
        ]
    },
    "SmokeSensor": {
        "topic": [
            {"name": "statusSmokeDetected"},
            {"name": "statusLowBattery"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "onSmokeDetected"},
            {"name": "onLowBattery"},
            {"name": "identify"}
        ]
    },
    "Speaker": {
        "topic": [
            {"name": "setMute"},
            {"name": "statusMute"},
            {"name": "setVolume"},
            {"name": "statusVolume"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "muteTrue"},
            {"name": "muteFalse"},
            {"name": "volumeFactor", "type": "Number"},
            {"name": "identify"}
        ]
    },
    "StatelessProgrammableSwitch": {
        "topic": [
            {
                "name": "statusEvent"
            },
            {
                "name": "identify"
            }
        ],
        "payload": [
            {
                "name": "identify"
            }
        ]
    },
    "Switch": {
        "topic": [
            {"name": "setOn"},
            {"name": "statusOn"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "onFalse"},
            {"name": "onTrue"},
            {"name": "identify"}
        ]
    },
    "TemperatureSensor": {
        "topic": [
            {"name": "statusTemperature"},
            {"name": "statusLowBattery"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "fahrenheit", "type": "Boolean"},
            {"name": "onLowBattery"},
            {"name": "identify"}
        ]
    },
    "Thermostat": {
        "topic": [
            {"name": "setTargetTemperature"},
            {"name": "statusTargetTemperature"},
            {"name": "statusCurrentTemperature"},
            {"name": "setTargetHeatingCoolingState"},
            {"name": "statusTargetHeatingCoolingState"},
            {"name": "statusCurrentHeatingCoolingState"},
            {"name": "setTargetRelativeHumidity"},
            {"name": "statusTargetRelativeHumidity"},
            {"name": "statusCurrentRelativeHumidity"},
            {"name": "setCoolingThresholdTemperature"},
            {"name": "statusCoolingThresholdTemperature"},
            {"name": "setHeatingThresholdTemperature"},
            {"name": "statusHeatingThresholdTemperature"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "identify"}
        ]
    },
    "Window": {
        "topic": [
            {"name": "setTargetPosition"},
            {"name": "statusTargetPosition"},
            {"name": "statusCurrentPosition"},
            {"name": "statusPositionState"},
            {"name": "statusObstruction"},
            {"name": "identify"}
        ],
        "payload": [
            {"name": "targetPositionFactor", "type": "Number"},
            {"name": "currentPositionFactor", "type": "Number"},
            {"name": "positionStatusDecreasing"},
            {"name": "positionStatusIncreasing"},
            {"name": "onObstructionDetected"},
            {"name": "identify"}
        ]
    },
    "WindowCovering": {
        "topic": [
            {
                "name": "setTargetPosition"
            },
            {
                "name": "statusTargetPosition"
            },
            {
                "name": "statusCurrentPosition"
            },
            {
                "name": "statusPositionState"
            },
            {
                "name": "identify"
            },
        ],
        "payload": [
            {
                "name": "targetPositionFactor",
                "type": "Number"
            },
            {
                "name": "currentPositionFactor",
                "type": "Number"
            },
            {
                "name": "positionStatusDecreasing"
            },
            {
                "name": "positionStatusIncreasing"
            },
            {
                "name": "identify"
            },
        ]
    }
};

let config = {};

$(document).ready(function () {

    const $gridServices = $('#gridServices');

    $gridServices.jqGrid({
        cmTemplate: {autoResizable: true},
        autowidth: true,
        width: '100%',
        caption: 'homekit2mqtt',
        guiStyle: 'bootstrap',
        hidegrid: false,
        iconSet: 'fontAwesome',
        colNames:['id', 'name', 'service'],

        colModel: [
            {
                name: 'id',
                index: 'id',
            },
            {
                name: 'name',
                index: 'name',
            },
            {
                name: 'service',
                index: 'service',
            }
        ],
        data: [],
        rowList: [5, 100, '10000:All'],
        rowNum: 10000,
        viewrecords: true,
        pager: true,

        onSelectRow: function (id, status) {
            if (status) {
                $editdel.removeAttr('disabled');
            } else {
                $editdel.attr('disabled', true);
            }

        },
        ondblClickRow: function (id) {
            edit(id);
        },

        loadComplete: function () {
           $('#edit, #del').attr('disabled', true);
        },

        beforeSelectRow: function(rowid, e) {
            return ($(this).getGridParam('selrow') != rowid);
        }

    }).jqGrid("navGrid", {
        add: false,
        edit: false,
        del: false,
        search: false,
        refresh: false
    }).jqGrid('navButtonAdd', {
        caption: 'Add',
        buttonicon: 'fa-plus',
        title: 'Add a Service',
        id: 'add'
    }).jqGrid('navButtonAdd', {
        caption: 'Edit',
        buttonicon: 'fa-wrench',
        title: 'Edit Service',
        id: 'edit'
    }).jqGrid('navButtonAdd', {
        caption: 'Del',
        buttonicon: 'fa-trash',
        title: 'Delete Service',
        id: 'del'
    })
        .jqGrid("filterToolbar").jqGrid("gridResize");

    const $selectService = $('#selectService');
    const $dialogService = $('#dialogService');
    const $dialogConfig = $('#dialogConfig');
    const $dialogConfirmDel = $('#dialogConfirmDel');
    const $next = $('#next');
    const $add = $('#add');
    const $del = $('#del');
    const $edit = $('#edit');

    const $service = $('#service');
    const $id = $('#id');
    const $name = $('#name');

    const $serviceConfirm = $('#serviceConfirm');
    const $idConfirm = $('#idConfirm');
    const $nameConfirm = $('#nameConfirm');

    const $configuration = $('#configuration');

    const $editdel = $('#edit, #del');
    $editdel.attr('disabled', true);

    $.get('/config', function (body) {
        config = JSON.parse(body);
        Object.keys(config).forEach(id => {
            $gridServices.jqGrid('addRowData', id, {
                id,
                name: config[id].name,
                service: config[id].service
            })
        });
    });

    servicesAvailable.forEach(service => {
        $selectService.append('<option>' + service + '</option>');
    });

    $add.click(function () {
        $dialogService.modal();
    });

    $next.click(function () {
        $dialogService.modal('hide');
        $id.removeAttr('disabled');
        createServiceForm($selectService.val());

        $dialogConfig.modal();
    });

    $edit.click(function () {
        edit($gridServices.getGridParam('selrow'));
    });

    $del.click(function () {
        confirmDel($gridServices.getGridParam('selrow'));
    });

    $('#delete').click(function () {

    });

    $('#save').click(function () {
        if (validate()) {
            const id = $.trim($id.val());
            const service = $service.val();
            const result = {
                id,
                name: $.trim($name.val()),
                service,
                manufacturer: $.trim($('#manufacturer').val()),
                model: $.trim($('#model').val()),
                serial: $.trim($('#serial').val())
            };

            const s = Service[service];

            if (s.topic) {
                result.topic = {};
                s.topic.forEach(topic => {
                    const val = $.trim($('#topic-' + topic.name).val());
                    result.topic[topic.name] = val;
                });
            }
            if (s.payload) {
                result.payload = {};
                s.payload.forEach(payload => {
                    const type = $('#payload-type-' + payload.name).val();
                    let val;
                    switch (type) {
                        case 'Undefined':
                            val = undefined;
                            break;
                        case 'Number':
                            val = parseFloat($('#payload-number-' + payload.name).val());
                            break;
                        case 'Boolean':
                            val = $('#payload-boolean-' + payload.name).val() === 'true';
                            break;
                        case 'String':
                            val = $('#payload-string-' + payload.name).val() === 'true';
                            break;
                    }
                    if (typeof val !== 'undefined') {
                        result.payload[payload.name] = val;
                    }
                });
            }
            if (!config[id]) {
                config[id] = {};
            }
            $.extend(config[id], result);

            Object.keys(config[id].topic).forEach(t => {
                if (config[id].topic[t] === '') {
                    delete config[id].topic[t];
                }
            });

            if (config[id].serial === '') {
                delete config[id].serial;
            }
            if (config[id].model === '') {
                delete config[id].model;
            }
            if (config[id].manufacturer === '') {
                delete config[id].manufacturer;
            }
            console.log(JSON.stringify(config[id], null, '  '));
            $.ajax({
                url: '/config',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(config)
            });
            $dialogConfig.modal('hide');
        }
    });

    function confirmDel(id) {
        const s = config[id];
        $idConfirm.val(id);
        $serviceConfirm.val(s.service);
        $nameConfirm.val(s.name);
        $dialogConfirmDel.modal();

    }

    function edit(id) {
        const s = config[id];

        createServiceForm(s.service);

        $id.attr('disabled', true);
        $id.val(id);
        $selectService.val(s.service);
        $name.val(s.name);

        Object.keys(s.topic).forEach(topic => {
            if (typeof s.topic[topic] !== 'undefined') {
                $('#topic-' + topic).val(s.topic[topic]);
            }
        });

        Object.keys(s.payload).forEach(payload => {
            console.log(payload, s.payload[payload])
            switch (typeof s.payload[payload]) {
                case 'boolean':
                    $('#payload-boolean-' + payload).val('' + (!!s.payload[payload]));
                    $('#payload-type-' + payload).val('Boolean').trigger('change');
                    break;
                case 'number':
                    $('#payload-number-' + payload).val(s.payload[payload]);
                    $('#payload-type-' + payload).val('Number').trigger('change');

                    break;
                default:
                    $('#payload-string-' + payload).val(s.payload[payload]);
                    $('#payload-type-' + payload).val('String').trigger('change');

            }
        });

        $('#manufacturer').val(s.manufacturer);
        $('#model').val(s.model);
        $('#serial').val(s.serial);

        $dialogConfig.modal({
            backdrop: 'static'
        });
    }

    function validate() {
        let valid = true;
        const id = $.trim($id.val());
        const name = $.trim($name.val());
        if (!$id.attr('disabled')) {
            if (config[id] || id === '') {
                $id.addClass('is-invalid');
                valid = false;
            } else {
                $id.removeClass('is-invalid');
            }
            $name.removeClass('is-invalid');
            Object.keys(config).forEach(i => {
                if (name === '' || config[i].name === name) {
                    $name.addClass('is-invalid');
                    valid = false;
                }
            });
        } else {
            $name.removeClass('is-invalid');
            Object.keys(config).forEach(i => {
                if (name === '' || (config[i].name === name && config[i].name !== config[id].name)) {
                    $name.addClass('is-invalid');
                    valid = false;
                }
            });
        }
        return valid;
    }

    function createServiceForm(service) {
        $id.val('');
        $name.val('');
        $('#manufacturer').val('');
        $('#model').val('');
        $('#serial').val('');

        const s = Service[service];
        $service.val(service);
        $configuration.html('<h4>MQTT Topics</h4>');

        s.topic.forEach(t => {
            $configuration.append(`
               <div class="form-group row">
                   <label for="topic-${t.name}" class="col-sm-3 col-form-label">${t.name}</label>
                   <div class="col-sm-9">
                       <input type="text" class="form-control" id="topic-${t.name}" class="topic" data-topic="${t.name}">
                   </div>
               </div>`);
        });

        if (s.payload && s.payload.length > 0) {
            $configuration.append('<h4>MQTT Payloads</h4>');
            s.payload.forEach(p => {
                $configuration.append(`
                   <div class="form-group row">
                       <label for="payload-${p.name}" class="col-sm-3 col-form-label">${p.name}</label>
                       <div id="payload-input-${p.name}" class="col-sm-9"></div>
                   </div>`);
                createPayloadInput(p, $('#payload-input-' + p.name));
            });
        }

    }

    function createPayloadInput(p, $elem) {
        const html = `<div class="input-group">
      <span class="input-group-addon">
        <select id="payload-type-${p.name}" data-payload="${p.name}" class="payload-type form-control" ${p.type ? 'disabled' : ''}>
          <option>Undefined</option>
          <option ${p.type === 'Number' ? 'selected' : ''}>Number</option>
          <option ${p.type === 'Boolean' ? 'selected' : ''}>Boolean</option>
          <option ${p.type === 'String' ? 'selected' : ''}>String</option>
        </select>
      </span>
      <input id="payload-undefined-${p.name}" data-payload="${p.name}" type="string" class="form-control payload Undefined" disabled>
      <input id="payload-number-${p.name}" data-payload="${p.name}" type="number" class="form-control payload Number">
      <input id="payload-string-${p.name}" data-payload="${p.name}" type="text" class="form-control payload String">
      <select id="payload-boolean-${p.name}" data-payload="${p.name}" class="form-control payload Boolean">
          <option value="false">False</option>
          <option value="true">True</option>
      </select>
    </div>`;
        $elem.append(html);
        const $type = $('#payload-type-' + p.name);
        $type.change(changeType);
        changeType();

        function changeType() {
            $elem.find('.payload').hide();
            $elem.find('.payload.'+ $type.val()).show();
        }
    }

});

