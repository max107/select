/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 06/04/16
 * Time: 13:08
 */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Select from './select';
import SelectAutocomplete from './select_autocomplete';

$.fn.selectizeAutocomplete = function (option) {
    var arg = arguments,
        settings = typeof option == 'object' && option;

    return this.each(function () {
        var $this = $(this),
            data = $this.data('selectize');

        if (!data) {
            let $wrapper = $('<div></div>'),
                $el = $(this);
            $wrapper.insertAfter($el);
            $el.remove();

            let params = settings.options || [],
                defaultValue = null;
            if ($el.is('select') && params.length == 0) {
                $el.children('option').each(function (i, opt) {
                    if (opt.getAttribute('selected') == 'selected') {
                        defaultValue = opt.value;
                    }
                    if (opt.value && opt.text) {
                        params.push({
                            value: opt.value,
                            label: opt.text
                        });
                    }
                });
                $el.remove();
            }

            let newParams = {
                ...settings,
                defaultValue,
                options: settings.options || params,
                name: this.getAttribute('name'),
                id: this.getAttribute('id'),
                value: this.value
            };

            data = ReactDOM.render(<SelectAutocomplete {...newParams} />, $wrapper.get(0));
            $this.data('selectize', data);
        }

        if (typeof option === 'string') {
            if (arg.length > 1) {
                data[option].apply(data, Array.prototype.slice.call(arg, 1));
            } else {
                data[option]();
            }
        }
    });
};

$.fn.extend({
    selectize: function (options) {
        let defaultOptions = {
            valueKey: 'value',
            labelKey: 'label'
        };

        let settings = {...defaultOptions, ...options};

        return this.each(function (i, el) {
            let $wrapper = $('<div></div>'),
                $el = $(el);
            $wrapper.insertAfter($el);

            let params = settings.options || [],
                defaultValue = null;
            if ($el.is('select') && params.length == 0) {
                $el.children('option').each(function (i, opt) {
                    if (opt.getAttribute('selected') == 'selected') {
                        defaultValue = opt.value;
                    }
                    if (opt.value && opt.text) {
                        params.push({
                            value: opt.value,
                            label: opt.text
                        });
                    }
                });
                $el.remove();
            }

            let newParams = {
                ...settings,
                defaultValue,
                options: settings.options || params,
                name: el.getAttribute('name')
            };
            ReactDOM.render(<Select {...newParams} />, $wrapper.get(0));
        });
    }
});
