const template = {
    Lightbulb: {
        'hue2mqtt extended color light': {
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
                setColorTemperature: 'hue/set/lights/%name%/ct',
                statusColorTemperature: 'hue/status/lights/%name%/ct',
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
            manufacturer: 'hue2mqtt',
            model: 'extended color light'
        },
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
            manufacturer: 'hue2mqtt',
            model: 'color light'
        },
        'hue2mqtt tunable white': {
            id: 'hue//lights/%name%',
            name: 'Hue %name%',
            topic: {
                setOn: 'hue/set/lights/%name%',
                statusOn: 'hue/status/lights/%name%',
                setBrightness: 'hue/set/lights/%name%',
                statusBrightness: 'hue/status/lights/%name%',
                setColorTemperature: 'hue/set/lights/%name%/ct',
                statusColorTemperature: 'hue/status/lights/%name%/ct',
                identify: 'hue/status/lights/%name%/alert'
            },
            payload: {
                onTrue: 254,
                onFalse: 0,
                brightnessFactor: 2.54,
                identify: 'select'
            },
            manufacturer: 'hue2mqtt',
            model: 'tunable white'
        },
        'hue2mqtt plug': {
            id: 'hue//lights/%name%',
            name: 'Hue %name%',
            topic: {
                setOn: 'hue/set/lights/%name%',
                statusOn: 'hue/status/lights/%name%',
                setBrightness: 'hue/set/lights/%name%',
                statusBrightness: 'hue/status/lights/%name%',
                identify: 'hue/status/lights/%name%/alert'
            },
            payload: {
                onTrue: 254,
                onFalse: 0,
                brightnessFactor: 2.54,
                identify: 'select'
            },
            manufacturer: 'hue2mqtt',
            model: 'plug'
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
