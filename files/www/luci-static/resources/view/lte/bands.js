'use strict';
'require view';
'require rpc';
'require ui';

var readStatus = rpc.declare({
    object: 'fxid5l_lte',
    method: 'status',
    expect: { '': {} }
});

var readImei = rpc.declare({ object: 'fxid5l_imei', method: 'status', expect: { '': {} } });
var applyBands = rpc.declare({
    object: 'fxid5l_control',
    method: 'apply',
    params: ['profile'],
    expect: { '': {} }
});

return view.extend({
    handleSave: null,
    handleSaveApply: null,
    handleReset: null,

    load: function() {
        return Promise.all([readStatus(), readImei().catch(function() { return {}; })]);
    },

    render: function(data) {
        var imei = (data && data[1]) || {}; data = (data && data[0]) || {};

        var select = E('select', { 'class': 'cbi-input-select' }, [
            E('option', { value: '', disabled: true, selected: true }, 'Select a profile'),
            E('option', { value: 'b3' }, 'B3 only'),
            E('option', { value: 'b1_b3' }, 'B1 + B3'),
            E('option', { value: 'original' }, 'Restore original bands')
        ]);

        var info = [
            ['Modem status', data.modem_online ? 'Online' : 'Unavailable'],
            ['Connected LTE band', data.band ? 'B' + data.band : 'Unavailable'],
            ['LTE band mask', data.lte_mask || 'Unavailable'],
            ['2G/3G band mask', data.gw_mask || 'Unavailable'],
            ['Cell ID', data.cell_id || 'Unavailable'],
            ['PCI', data.pci || 'Unavailable'],
            ['EARFCN', data.earfcn || 'Unavailable']
        ];

        var rows = info.map(function(item) {
            return E('tr', {}, [
                E('td', {}, item[0]),
                E('td', {}, String(item[1]))
            ]);
        });

        var applyButton = E('button', {
            'class': 'btn cbi-button cbi-button-apply',
            'click': function() {
                var profile = select.value;

                if (!profile) {
                    ui.addNotification(null, E('p', {}, 'Select a profile first.'), 'warning');
                    return;
                }

                var label = select.options[select.selectedIndex].text;

                if (!window.confirm('Apply ' + label + '?\nLTE may disconnect temporarily. The setting may survive a reboot.'))
                    return;

                applyButton.disabled = true;

                applyBands(profile).then(function(result) {
                    var success = result.success && result.verified;
                    var message = success
                        ? 'Applied and verified mask: ' + result.current_mask + '. Refresh to update status.'
                        : 'Change could not be verified. Current mask: ' + (result.current_mask || 'unknown');

                    ui.addNotification(null, E('p', {}, message), success ? 'info' : 'danger');
                }).catch(function(err) {
                    ui.addNotification(null, E('p', {}, 'RPC error: ' + err), 'danger');
                }).finally(function() {
                    applyButton.disabled = false;
                });
            }
        }, 'Apply selected profile');

        return E('div', { 'class': 'cbi-map' }, [
            E('h2', {}, 'FX-ID5L LTE Band Manager'),
            E('p', {}, 'Live LTE modem information'),
            E('div', { 'class': 'cbi-section' }, [
                E('table', { 'class': 'table' }, rows)
            ]),
            E('div', { 'class': 'cbi-section' }, [E('h3', {}, 'IMEI Management'), E('p', {}, imei.readable ? (imei.matches_factory ? 'Current IMEI matches factory record' : 'WARNING: IMEI differs from factory record') : 'IMEI verification unavailable')]),
            E('h3', {}, 'LTE Band Selection'),
            E('p', {}, 'Select a profile and confirm before applying.'),
            E('div', { 'class': 'cbi-section' }, [
                select, ' ', applyButton
            ])
        ]);
    }
});
