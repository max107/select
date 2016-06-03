/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 06/04/16
 * Time: 13:08
 */

import React from 'react';
import SelectBase from './select_base';

export default class Select extends SelectBase {
    static propTypes = {
        ...SelectBase.propTypes
    };

    static defaultProps = {
        ...SelectBase.defaultProps
    };

    componentWillMount() {
        super.componentWillMount();
        let value = this.props.value || this.props.defaultValue;

        this.setState({
            currentOption: this.findOptionByValue(value, this.props.options),
            all: this.props.options,
            options: this.props.options
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

                        let options = this.filterOptions('');
                        this.setState({
                            filterValue: '',
                            options: [option, ...options],
                            stateMessage: undefined,
                            all: [...this.state.all, option],
                            currentOption: option,
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

    render() {
        const { placeholder, name, currentValueComponent, currentPlaceholderComponent, labelKey, valueKey } = this.props;
        const { currentOption } = this.state;

        let currentValue;

        if (!currentOption.value) {
            currentValue = React.createElement(currentPlaceholderComponent, {
                placeholder
            });
        } else {
            currentValue = React.createElement(currentValueComponent, {
                option: currentOption,
                placeholder,
                labelKey,
                valueKey,
                name
            });
        }
        return (
            <div ref="control"
                 tabIndex="1"
                 onKeyDown={this.handleKeyDown.bind(this)}
                 className="select-container">

                <div className="select-input"
                     tabIndex="-1"
                     onClick={this.handleOnClickWrapper.bind(this)}>
                    {this.renderClear()}
                    {currentValue}
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
            </div>
        )
    }
}
