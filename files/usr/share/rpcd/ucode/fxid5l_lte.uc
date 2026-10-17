'use strict';

const fs = require('fs');

function atQuery(command) {
    let p = fs.popen(
        "printf '" + command + "\\r' | /usr/bin/socat -t 2 - /dev/ttyACM0,rawer,echo=0,b115200",
        "r"
    );

    if (!p)
        return '';

    let output = p.read('all') || '';
    p.close();

    return output;
}

return {
    fxid5l_lte: {
        status: {
            call: function(request) {
                let bands = atQuery('AT+ZNLOCKBAND?');
                let cell = atQuery('AT+ZCELLINFO?');

                let mask = match(bands,
                    /\+ZNLOCKBAND:\s*([0-9A-Fa-f]+),([0-9A-Fa-f]+)/);

                let serving = match(cell,
                    /\+ZCELLINFO:\s*(\d+),(\d+),LTE B(\d+),(\d+)/);

                return {
                    modem_online: !!(mask && serving),
                    lte_mask: mask ? mask[1] : null,
                    gw_mask: mask ? mask[2] : null,
                    cell_id: serving ? serving[1] : null,
                    pci: serving ? serving[2] : null,
                    band: serving ? serving[3] : null,
                    earfcn: serving ? serving[4] : null
                };
            }
        }
    }
};
