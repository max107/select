/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 06/04/16
 * Time: 13:08
 */

import React, { Component, PropTypes } from 'react';

export default class Option extends Component {
    static propTypes = {
        onClick: PropTypes.func,
        onMouseOver: PropTypes.func,
        option: PropTypes.object.isRequired,
        disabled: PropTypes.bool.isRequired,
        isFocused: PropTypes.bool.isRequired,
        labelKey: PropTypes.string.isRequired
    };

    static defaultProps = {
        className: "option-item"
    };

    render() {
        const { disabled, labelKey, className, onClick, onMouseOver, option, isFocused } = this.props;
        return <div onClick={onClick} onMouseOver={onMouseOver}
                    className={className + (isFocused ? ' active' : '') + (disabled ? ' disabled' : '')}>{option[labelKey]}</div>;
    }
}
