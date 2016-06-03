/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 06/04/16
 * Time: 13:08
 */
import React, { Component, PropTypes } from 'react';

export default class CurrentPlaceholder extends Component {
    static propTypes = {
        placeholder: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ])
    };

    render() {
        return <span className="placeholder">{String(this.props.placeholder)}</span>;
    }
}