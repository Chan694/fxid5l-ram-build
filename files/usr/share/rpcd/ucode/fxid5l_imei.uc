'use strict';

const fs = require('fs');

function query(command) {
    let p = fs.popen(
        "printf '" + command + "\\r' | /usr/bin/socat -t 3 - /dev/ttyACM0,rawer,echo=0,b115200",
        'r'
    );

    if (!p)
        return '';

    let result = p.read('all') || '';
    p.close();
    return result;
}

return {
    fxid5l_imei: {
        status: {
            call: function() {
                let current = match(query('AT+CGSN'),
                    /\n([0-9]{15})\r?\n/);

                let factory = match(query('AT*MRD_IMEI=R,0'),
                    /\*MRD_IMEI:[^,]*,[^,]*,\s*([0-9]{15})/);

                return {
                    readable: !!(current && factory),
                    active_imei_masked: current ? "***********" + substr(current[1], 11) : null,
                    factory_imei_masked: factory ? "***********" + substr(factory[1], 11) : null,
                    matches_factory: current && factory
                        ? current[1] == factory[1] : null
                };
            }
        }
    }
};
