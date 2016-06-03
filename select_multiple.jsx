/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 06/04/16
 * Time: 13:08
 */

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import CurrentValueMultiple from './current_value_multiple';
import SelectBase from './select_base';
import _ from 'underscore';

export default class SelectMultiple extends SelectBase {
    static propTypes = {
        ...SelectBase.propTypes
    };

    static defaultProps = {
        ...SelectBase.defaultProps,
        currentValueComponent: CurrentValueMultiple
    };

    componentWillMount() {
        super.componentWillMount();

        const { options }  = this.props;
        let value = this.props.value || this.props.defaultValue;

        let currentOptions = [];
        for (let i in value) {
            let tmp = this.findOptionByValue(value[i], options);
            if (tmp && tmp.length > 0) {
                currentOptions.concat(tmp);
            }
        }

        this.setState({
            all: this.props.options,
            options: this.props.options,
            currentOptions
        });
    }

    onValueRemove(item, e) {
        e.preventDefault();
        let { all, currentOptions } = this.state;
        const { valueKey } = this.props;

        let items = _.reject(currentOptions, obj => obj[valueKey] == item[valueKey]);

        this.setState({
            currentOptions: items,
            options: _.reject(all, obj => {
                return _.find(items, {
                    [valueKey]: obj[valueKey]
                });
            })
        });
    }

    selectOption(currentOption) {
        const { isAsync, options, valueKey } = this.props;
        let newOptions = _.reject(this.state.options, obj => obj[valueKey] == currentOption[valueKey]);
        this.setState({
            options: newOptions,
            currentOptions: [...this.state.currentOptions, currentOption],
            isOpen: false
        }, () => {
            this._unbindCloseMenuIfClickedOutside();
            this.fireChangeEvent(currentOption[valueKey], isAsync ? this.state.options : options);
        });
    }

    handleCreate(e) {
        e.preventDefault();

        const { onCreate } = this.props;
        const { filterValue } = this.state;

        if (onCreate) {
            this.setState({
                isLoading: true
            }, () => {
                let promise = onCreate(filterValue);
                if (typeof promise === "object") {
                    promise.then(option => {
                        this.clearInputValue();
                        this.setState({
                            filterValue: '',
                            options: this.filterOptions(''),
                            all: [...this.state.all, option],
                            currentOptions: [...this.state.currentOptions, option],
                            isLoading: false,
                            isOpen: false
                        });
                    });
                } else {
                    throw new Error('onCreate callback should return Promise');
                }
            });
        }
    }

    filterOptions(value) {
        const { valueKey } = this.props;
        const { currentOptions } = this.state;

        return _.reject(super.filterOptions(value), obj => {
            return _.find(currentOptions, t => t[valueKey] == obj[valueKey]);
        });
    }

    render() {
        const { currentOptions } = this.state;
        const { currentValueComponent, currentPlaceholderComponent, placeholder, name, labelKey, valueKey } = this.props;

        let placeholderNode = React.createElement(currentPlaceholderComponent, {
                placeholder
            }),
            currentValue = currentOptions.map((option, key) => {
                return React.createElement(currentValueComponent, {
                    option, placeholder, name, key, labelKey, valueKey,
                    onRemove: this.onValueRemove.bind(this)
                });
            });

        return (
            <div ref="control"
                 tabIndex="1"
                 onKeyDown={this.handleKeyDown.bind(this)}
                 className="select-container multiple">

                <div className="select-input"
                     tabIndex="-1"
                     onClick={this.handleOnClickWrapper.bind(this)}>
                    {placeholderNode}
                </div>
                <div ref="selectMenuContainer"
                     className={"select-options-container" + (this.state.isOpen ? "" : " hide")}>
                    <div className="select-options-list" onKeyDown={this.handleKeyDown.bind(this)}>
                        {this.renderSearchInput()}
                        <div className="select-options-wrapper">
                            {this.renderMenu()}
                        </div>
                    </div>
                </div>
                <div className="select-values">
                    {currentValue}
                </div>
            </div>
        )
    }
}