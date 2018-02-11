/* global $, document, window, location */

let services = {};
let config = {};
const template = {
    Lightbulb: {
        'hue2mqtt color light': {
            id: 'hue//lights/%name%',
            name: 'Hue %name%',
            topic: {
                setOn: 'hue/set/lights/%name%',
                statusOn: 'hue/status/lights/%name%',
                setBrightness: 'hue/set/lights/%name%',
                statusBrightness: 'hue/status/lights/%name%',
                setHue: 'hue/set/lights/%name%/hue',
                statusHue: 'hue/status/lights/%name%/hue',
                setSaturation: 'hue/set/lights/%name%/sat',
                statusSaturation: 'hue/status/lights/%name%/sat',
                identify: 'hue/status/lights/%name%/alert'
            },
            payload: {
                onTrue: 254,
                onFalse: 0,
                brightnessFactor: 2.54,
                hueFactor: 181.327,
                saturationFactor: 2.54,
                identify: 'select'
            },
            manufacturer: 'hue2mqtt - Hue',
            model: 'color light'
        }
    },
    WindowCovering: {
        'hm2mqtt.js blind': {
            id: 'hm//%name%',
            name: '%name%',
            topic: {
                setTargetPosition: 'hm/set/%name%/LEVEL',
                statusTargetPosition: 'hm/status/%name%/LEVEL_NOTWORKING',
                statusCurrentPosition: 'hm/status/%name%/LEVEL_NOTWORKING',
                statusPositionState: 'hm/status/%name%/DIRECTION'
            },
            payload: {
                targetPositionFactor: 0.01,
                currentPositionFactor: 0.01,
                positionStatusDecreasing: 2,
                positionStatusIncreasing: 1
            },
            manufacturer: 'hm2mqtt.js - Homematic',
            model: 'BLIND'
        }
    }
};

$(document).ready(() => {
    let topics = [];
    $.get('/topics', body => {
        topics = JSON.parse(body);
    });

    const $gridServices = $('#gridServices');

    $gridServices.jqGrid({
        cmTemplate: {autoResizable: true},
        autowidth: true,
        width: '100%',
        caption: 'homekit2mqtt',
        guiStyle: 'bootstrap',
        hidegrid: false,
        iconSet: 'fontAwesome',
        colNames: ['id', 'name', 'service'],

        colModel: [
            {
                name: 'id',
                index: 'id'
            },
            {
                name: 'name',
                index: 'name'
            },
            {
                name: 'service',
                index: 'service'
            }
        ],
        data: [],
        rowList: [25, 100, '10000:All'],
        rowNum: 10000,
        viewrecords: true,
        pager: true,

        onSelectRow(id, status) {
            if (status) {
                $('#edit, #del').removeAttr('disabled');
            } else {
                $('#edit, #del').attr('disabled', true);
            }
        },
        ondblClickRow(id) {
            edit(id);
        },

        loadComplete() {
            $('#edit, #del').attr('disabled', true);
        },

        beforeSelectRow(rowid) {
            return ($(this).getGridParam('selrow') !== rowid);
        }

    }).jqGrid('navGrid', {
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
    }).jqGrid('navButtonAdd', {
        caption: 'Stop',
        buttonicon: 'fa-stop-circle-o',
        title: 'Stop homekit2mqtt',
        id: 'stop'
    })
    .jqGrid('filterToolbar', {defaultSearch: 'cn', ignoreCase: true, searchOnEnter: false})
    .jqGrid('gridResize');

    const $selectService = $('#selectService');
    const $dialogService = $('#dialogService');
    const $dialogConfig = $('#dialogConfig');
    const $dialogConfirmDel = $('#dialogConfirmDel');
    const $next = $('#next');
    const $add = $('#add');
    const $del = $('#del');
    const $edit = $('#edit');
    const $stop = $('#stop');

    const $service = $('#service');
    const $id = $('#id');
    const $name = $('#name');

    const $serviceConfirm = $('#serviceConfirm');
    const $idConfirm = $('#idConfirm');
    const $nameConfirm = $('#nameConfirm');

    const $configuration = $('#configuration');

    $('#edit, #del').attr('disabled', true);

    $.get('/config', body => {
        config = JSON.parse(body);
        loadConfig();
    });

    function loadConfig() {
        Object.keys(config).forEach(id => {
            $gridServices.jqGrid('addRowData', id, {
                id,
                name: config[id].name,
                service: config[id].service
            });
        });
        $gridServices.jqGrid('sortGrid', 'name', true, 'asc');
    }

    $.get('/services.json', body => {
        services = body;
        Object.keys(services).forEach(service => {
            $selectService.append('<option>' + service + '</option>');
        });

        $selectService.change(function () {
            createTemplate($(this).val());
        });
    });

    function createTemplate(s) {
        console.log(s);
        $('#selectTemplate').html('<option>none</option>');
        $('#selectTemplate').val('none');
        $('.name-template, .select-template').hide();
        if (template[s]) {
            $('.select-template').show();
            Object.keys(template[s]).forEach(t => {
                $('#selectTemplate').append('<option>' + t + '</option>');
            });
            $('#selectTemplate').change(function () {
                if ($(this).val() === 'none') {
                    $('.name-template').hide();
                } else {
                    $('.name-template').show();
                }
            });
        }
    }

    $add.click(() => {
        createTemplate($selectService.val());
        $dialogService.modal();
    });

    $next.click(() => {
        $dialogService.modal('hide');
        $id.removeAttr('disabled');
        createServiceForm($selectService.val());
        if ($('#selectTemplate').val() !== 'none') {
            const tpl = template[$selectService.val()][$('#selectTemplate').val()];
            const name = $('#nameTemplate').val();
            $id.val(tplReplace(tpl.id, name));
            $name.val(tplReplace(tpl.name, name));
            $('#model').val(tplReplace(tpl.model, name));
            $('#manufacturer').val(tplReplace(tpl.manufacturer, name));
            Object.keys(tpl.topic).forEach(t => {
                $('#topic-' + t).val(tplReplace(tpl.topic[t], name));
            });
            Object.keys(tpl.payload).forEach(p => {
                const val = tpl.payload[p];
                console.log(p, val, typeof val);
                switch (typeof val) {
                    case 'number':
                        $('#payload-type-' + p).val('Number').trigger('change');
                        $('#payload-number-' + p).val(val);
                        break;
                    case 'string':
                        $('#payload-type-' + p).val('String').trigger('change');
                        $('#payload-string-' + p).val(val);
                        break;
                    case 'boolean':
                        $('#payload-type-' + p).val('Boolean').trigger('change');
                        $('#payload-boolean-' + p).val(String(val));
                        break;
                    default:
                }
            });
        }
        $dialogConfig.modal();
    });

    function tplReplace(val, name) {
        return val.replace(/%name%/g, name);
    }

    $edit.click(() => {
        edit($gridServices.getGridParam('selrow'));
    });

    $del.click(() => {
        confirmDel($gridServices.getGridParam('selrow'));
    });

    $('#delete').click(() => {
        const id = $gridServices.getGridParam('selrow');
        $gridServices.jqGrid('delRowData', id);
        $('#edit, #del').attr('disabled', true);
        console.log('delete', id);
        delete config[id];
        $.ajax({
            url: '/config',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(config)
        });
        $dialogConfirmDel.modal('hide');
    });

    $stop.click(() => {
        $.get('/quit');
        setTimeout(() => {
            location.reload();
        }, 3000);
    });

    $('#save').click(() => {
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

            const s = services[service];

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
                            val = $('#payload-string-' + payload.name).val();
                            break;
                        default:
                    }
                    console.log(payload.name, type, val);

                    if (typeof val !== 'undefined') {
                        result.payload[payload.name] = val;
                    }
                });
            }

            if (s.config) {
                result.config = {};
                s.config.forEach(c => {
                    const val = $.trim($('#config-' + c.name).val());
                    result.config[c.name] = val;
                });
            }

            if (!config[id]) {
                config[id] = {};
            }
            console.log(result);

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
            $.ajax({
                url: '/config',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(config)
            });

            $dialogConfig.modal('hide');
            if (!$id.attr('disabled')) {
                $gridServices.jqGrid('addRowData', id, {
                    id,
                    name: config[id].name,
                    service: config[id].service
                });
                $gridServices.trigger('reloadGrid').jqGrid('sortGrid', 'name', true, 'asc');
                $gridServices.jqGrid('setSelection', id, true);
                $('#gridServices [id="' + id + '"]').focus();
            }
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
            console.log(payload, s.payload[payload]);
            switch (typeof s.payload[payload]) {
                case 'boolean':
                    $('#payload-boolean-' + payload).val(String(Boolean(s.payload[payload])));
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

        Object.keys(s.config).forEach(c => {
            console.log(c, s.config[c]);
            if (typeof s.config[c] !== 'undefined') {
                $('#config-' + c).val(s.config[c]);
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
        if ($id.attr('disabled')) {
            $name.removeClass('is-invalid');
            Object.keys(config).forEach(i => {
                if (name === '' || (config[i].name === name && config[i].name !== config[id].name)) {
                    $name.addClass('is-invalid');
                    valid = false;
                }
            });
        } else {
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
        }
        return valid;
    }

    function createServiceForm(service) {
        $id.val('');
        $name.val('');
        $('#manufacturer').val('');
        $('#model').val('');
        $('#serial').val('');

        const s = services[service];
        $service.val(service);
        $configuration.html('<h4>MQTT Topics</h4>');

        s.topic.forEach(t => {
            $configuration.append(`
               <div class="form-group row">
                   <label for="topic-${t.name}" class="col-sm-4 col-form-label">${t.name}</label>
                   <div class="col-sm-8">
                       <input type="text" class="form-control topic" id="topic-${t.name}" data-topic="${t.name}" autocomplete="off">
                   </div>
               </div>`);
        });

        $('input.topic').each(function () {
            $(this).typeahead({source: topics});
        });

        if (s.payload && s.payload.length > 0) {
            $configuration.append('<h4>MQTT Payloads</h4>');
            s.payload.forEach(p => {
                $configuration.append(`
                   <div class="form-group row">
                       <label for="payload-${p.name}" class="col-sm-4 col-form-label">${p.name}</label>
                       <div id="payload-input-${p.name}" class="col-sm-8"></div>
                   </div>`);
                createPayloadInput(p, $('#payload-input-' + p.name));
            });
        }

        if (s.config && s.config.length > 0) {
            $configuration.append('<h4>Configuration</h4>');
            s.config.forEach(c => {
                $configuration.append(`
                   <div class="form-group row">
                       <label for="config-${c.name}" class="col-sm-4 col-form-label">${c.name}</label>
                       <div id="config-input-${c.name}" class="col-sm-8"></div>
                   </div>`);
                createConfigInput(c, $('#config-input-' + c.name));
            });
        }
    }

    function createConfigInput(c, $elem) {
        let html = '<div>';
        if (c.enum) {
            html += `<select id="config-${c.name}" class="config-enum form-control">`;
            c.enum.forEach((o, i) => {
                html += `<option value="${i}">${o}</option>`;
            });
            html += '</select>';
        } else {


        }
        html += '</div>';
        $elem.append(html);
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
            $elem.find('.payload.' + $type.val()).show();
        }
    }

    resizeGrid();
    $(window).resize(resizeGrid);

    function resizeGrid() {
        const height = $(window).height() - 128;
        const width = $(window).width() - 14;
        $gridServices
            .jqGrid('setGridWidth', width)
            .jqGrid('setGridHeight', height)
            .jqGrid('gridResize');
    }
});

