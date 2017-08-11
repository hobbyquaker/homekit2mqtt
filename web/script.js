$(document).ready(function () {
    $('#accessories').jqGrid({
        //cmTemplate: {autoResizable: true, editable: true},
        //autowidth: true,
        //width: '100%',
        caption: 'homekit2mqtt Accessories',
        //height: 200,
        guiStyle: 'bootstrap',
        //inlineEditing: {keys: true},
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

    });

    $.get('/config', function (body) {
        let config = JSON.parse(body);
        Object.keys(config).forEach(id => {
            $('#accessories').jqGrid('addRowData', id, {
                id,
                name: config[id].name,
                service: config[id].service
            })
        });
    });
});