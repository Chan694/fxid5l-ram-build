'use strict';

const fs = require('fs');

const profiles = {
    b3: 'AT+ZNLOCKBAND=1,0,4,0',
    b1_b3: 'AT+ZNLOCKBAND=1,0,5,0',
    original: 'AT+ZNLOCKBAND=1,0,1E008000095,0'
};

function atQuery(command) {
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

function getMask() {
    let response = atQuery('AT+ZNLOCKBAND?');
    let m = match(response, /\+ZNLOCKBAND:\s*([0-9A-Fa-f]+),([0-9A-Fa-f]+)/);
    return m ? m[1] : null;
}

return {
    fxid5l_control: {
        preview: {
            args: { profile: '' },
            call: function(request) {
                let profile = request.args.profile;
                return {
                    allowed: !!profiles[profile],
                    profile: profile,
                    changes_applied: false
                };
            }
        },

        apply: {
            args: { profile: '' },
            call: function(request) {
                let profile = request.args.profile;
                let command = (profile == 'b3' || profile == 'b1_b3' || profile == 'original') ? profiles[profile] : null;

                if (!command)
                    return { success: false, error: 'Unsupported profile' };

                let before = getMask();

                if (!before)
                    return { success: false, error: 'Cannot read current band mask' };

                let response = atQuery(command);
                let accepted = !!match(response, /\bOK\b/);
                let after = getMask();

                return {
                    success: accepted && after == (profile == 'b3' ? '4' : profile == 'b1_b3' ? '5' : '1E008000095'),
                    verified: after == (profile == 'b3' ? '4' : profile == 'b1_b3' ? '5' : '1E008000095'),
                    previous_mask: before,
                    current_mask: after,
                    profile: profile
                };
            }
        }
    }
};
