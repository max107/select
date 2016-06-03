/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 06/04/16
 * Time: 13:08
 */
import React, { Component, PropTypes } from 'react';
import CurrentValue from './current_value';

export default class CurrentValueMultiple extends CurrentValue {
    static propTypes = {
        ...CurrentValue.propTypes,
        onRemove: PropTypes.func.isRequired
    };

    render() {
        const { option, valueKey, onRemove } = this.props;
        return (
            <span>
                <input type="hidden" value={option[valueKey] || ''} name={option}/>
                <span className="current-value">
                    {option.label}
                    <span onClick={onRemove.bind(this, option)} className="close">
                        <i className="icon trash"/>
                    </span>
                </span>
            </span>
        );
    }
}