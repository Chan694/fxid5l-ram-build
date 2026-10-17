'use strict';
'require view';
'require rpc';

function validIMEI(s) {
    if (!/^[0-9]{15}$/.test(s))
        return false;

    var sum = 0;

    for (var i = 0; i < 15; i++) {
        var n = Number(s.charAt(i));

        if (i % 2 === 1) {
            n *= 2;
            if (n > 9)
                n -= 9;
        }

        sum += n;
    }

    return sum % 10 === 0;
}

var readImei = rpc.declare({
    object: 'fxid5l_imei',
    method: 'status',
    expect: { '': {} }
});

function statusText(data) {
    if (!data || !data.readable)
        return 'IMEI verification unavailable';

    if (data.matches_factory)
        return 'Active IMEI matches stored factory IMEI';

    return 'WARNING: Active IMEI differs from stored factory IMEI';
}

return view.extend({
    handleSave: null,
    handleSaveApply: null,
    handleReset: null,

    load: function() {
        return readImei().catch(function() {
            return {};
        });
    },

    render: function(data) {
        data = data || {};

        var activeValue = E('strong', {},
            data.active_imei_masked || 'Unavailable');

        var factoryValue = E('strong', {},
            data.factory_imei_masked || 'Unavailable');

        var statusValue = E('strong', {}, statusText(data));

        var refreshResult = E('p', {}, '');

        var refreshButton = E('button', {
            'class': 'btn cbi-button',
            'click': function(ev) {
                ev.preventDefault();

                refreshButton.disabled = true;
                refreshResult.textContent = 'Refreshing modem status...';

                return readImei().then(function(result) {
                    result = result || {};

                    activeValue.textContent =
                        result.active_imei_masked || 'Unavailable';

                    factoryValue.textContent =
                        result.factory_imei_masked || 'Unavailable';

                    statusValue.textContent = statusText(result);

                    refreshResult.textContent = 'Status refreshed.';
                }).catch(function() {
                    refreshResult.textContent =
                        'Unable to retrieve modem status.';
                }).then(function() {
                    refreshButton.disabled = false;
                });
            }
        }, 'Refresh Status');

        var field = E('input', {
            'class': 'cbi-input-text',
            'maxlength': '15',
            'inputmode': 'numeric',
            'autocomplete': 'off',
            'placeholder': 'Enter 15-digit test IMEI'
        });

        var validationResult = E('p', {},
            'No factory changes enabled.');

        var validateButton = E('button', {
            'class': 'btn cbi-button',
            'click': function(ev) {
                ev.preventDefault();

                validationResult.textContent = validIMEI(field.value)
                    ? 'Valid checksum. No write performed.'
                    : 'Invalid IMEI format or checksum.';
            }
        }, 'Validate IMEI');

        return E('div', { 'class': 'cbi-map' }, [
            E('h2', {}, 'FX-ID5L IMEI Engineering Lab'),

            E('h3', {}, 'Modem Identity Status'),

            E('p', {}, [
                'Active IMEI: ',
                activeValue
            ]),

            E('p', {}, [
                'Stored Factory IMEI: ',
                factoryValue
            ]),

            E('p', {}, [
                'Verification: ',
                statusValue
            ]),

            E('p', {}, refreshButton),

            refreshResult,

            E('hr'),

            E('h3', {}, 'IMEI Validation'),

            E('p', {},
                'Check a 15-digit test identifier without changing the modem.'),

            field,

            E('p', {}, validateButton),

            validationResult
        ]);
    }
});
