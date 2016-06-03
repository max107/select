/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 06/04/16
 * Time: 13:08
 */
import React, { Component, PropTypes } from 'react';

export default class CurrentValue extends Component {
    static propTypes = {
        option: PropTypes.object.isRequired,
        name: PropTypes.string,
        labelKey: PropTypes.string.isRequired,
        valueKey: PropTypes.string.isRequired
    };

    static defaultProps = {
        name: null
    };

    render() {
        const { option, valueKey, labelKey, name } = this.props;

        return (
            <span>
                <input type="hidden" value={option[valueKey] || ''} name={name}/>
                <span className="current-value">{option[labelKey]}</span>
            </span>
        );
    }
}