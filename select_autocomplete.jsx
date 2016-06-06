/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 06/04/16
 * Time: 13:08
 */

import React from 'react';
import SelectBase from './select_base';

export default class Select extends SelectBase {
    static propTypes = SelectBase.propTypes;
    static defaultProps = SelectBase.defaultProps;

    componentWillMount() {
        super.componentWillMount();
        let value = this.props.value || this.props.defaultValue;

        this.setState({
            currentOption: this.findOptionByValue(value, this.props.options),
            all: this.props.options,
            options: this.props.options
        });
    }

    selectOption(currentOption) {
        const { isAsync, valueKey, labelKey } = this.props;
        const { options } = this.state;
        this.setState({
            currentOption, isOpen: false,
            filterValue: currentOption[labelKey] || ''
        }, () => {
            this._unbindCloseMenuIfClickedOutside();
            this.fireChangeEvent(currentOption[valueKey], isAsync ? this.state.options : options);
        });
    }

    handleKeyDown(e) {
        if (this.props.disabled) {
            return;
        }

        switch (e.keyCode) {
            case 9: // tab
                if (e.shiftKey || !this.state.isOpen || !this.state.focusedOption) {
                    return;
                }
                this.selectFocusedOption();
                break;
            case 13: // enter
                if (!this.state.isOpen) {
                    return;
                }
                this.selectFocusedOption();
                break;
            case 27: // escape
                if (this.state.isOpen) {
                    this.setState({
                        isOpen: false
                    }, this._unbindCloseMenuIfClickedOutside.bind(this));
                }
                break;
            case 38: // up
                this.focusPreviousOption();
                break;
            case 40: // down
                this.focusNextOption();
                break;
            default:
                return;
        }
        e.preventDefault();
    }

    renderMenu() {
        return this.renderOptions();
    }

    handleOnClickWrapper(e) {
        const { isOpen, options } = this.state;
        if (!isOpen && !this.isLoading() && options.length > 0) {
            this.setState({
                stateMessage: undefined,
                isOpen: true
            }, this._bindCloseMenuIfClickedOutside.bind(this));
        }
    }

    handleFilterOptions(e) {
        if ([18, 13, 27].indexOf(e.keyCode) > -1) {
            return;
        }

        const { filterValue } = this.state;

        let filteredOptions = this.filterOptions(filterValue);
        this.setState({
            stateMessage: undefined,
            options: filteredOptions,
            isOpen: filteredOptions.length > 0
        });
    }

    render() {
        return (
            <div ref="control"
                 tabIndex="1"
                 onKeyDown={this.handleKeyDown.bind(this)}
                 className="select-container">

                <div className="select-input autocomplete"
                     onClick={this.handleOnClickWrapper.bind(this)}>
                    {this.renderSearchInput()}

                </div>
                <div ref="selectMenuContainer"
                     className={"select-options-container" + (this.state.isOpen ? "" : " hide")}>
                    <div className="select-options-list" onKeyDown={this.handleKeyDown.bind(this)}>
                        <div className="select-options-wrapper">
                            {this.renderMenu()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
