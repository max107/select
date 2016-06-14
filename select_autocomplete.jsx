/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 06/04/16
 * Time: 13:08
 */

import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import Option from './option';

export default class Select extends Component {
    _timer = undefined;

    static propTypes = {
        isAsync: PropTypes.bool,
        options: PropTypes.array,
        valueKey: PropTypes.string,
        labelKey: PropTypes.string,
        defaultValue: PropTypes.any,
        value: PropTypes.any,
        placeholder: PropTypes.string,
        optionComponent: PropTypes.func,
        loadingText: PropTypes.string,
        onChangeInterval: PropTypes.number,
        minFilterLength: PropTypes.number,
        ignoreCase: PropTypes.bool,
        isLoading: PropTypes.bool,
        onChange: PropTypes.func,
        onInputChange: PropTypes.func,
        onCreate: PropTypes.func
    };

    static defaultProps = {
        isAsync: false,
        options: [],
        placeholder: 'Выбор...',
        loadingText: 'Поиск...',
        valueKey: 'value',
        labelKey: 'label',
        minFilterLength: 2,
        onChangeInterval: 150,
        onChange: undefined,
        onInputChange: undefined,
        optionComponent: Option,
        isLoading: false,
        ignoreCase: true,
        defaultValue: undefined,
        value: undefined,
        onCreate: undefined
    };

    state = {
        all: [],
        isFocused: false,
        filterValue: '',
        isLoading: false,
        options: [],
        focusedOption: {},
        isOpen: false
    };

    bindEvents() {
        this._closeMenuIfClickedOutside = (e) => {
            if (!this.state.isOpen) {
                return;
            }

            let menuElem = findDOMNode(this.refs.selectMenuContainer),
                controlElem = findDOMNode(this.refs.control),
                eventOccuredOutsideMenu = this.clickedOutsideElement(menuElem, e),
                eventOccuredOutsideControl = this.clickedOutsideElement(controlElem, e);

            // Hide dropdown menu if click occurred outside of menu
            if (eventOccuredOutsideMenu && eventOccuredOutsideControl) {
                this.setState({
                    isOpen: false,
                    focusedOption: {}
                }, this._unbindCloseMenuIfClickedOutside.bind(this));
            }
        };

        this._bindCloseMenuIfClickedOutside = () => {
            if (!document.addEventListener && document.attachEvent) {
                document.attachEvent('onclick', this._closeMenuIfClickedOutside.bind(this));
            } else {
                document.addEventListener('click', this._closeMenuIfClickedOutside.bind(this));
            }
        };
        this._unbindCloseMenuIfClickedOutside = () => {
            clearTimeout(this._timer);

            if (!document.removeEventListener && document.detachEvent) {
                document.detachEvent('onclick', this._closeMenuIfClickedOutside.bind(this));
            } else {
                document.removeEventListener('click', this._closeMenuIfClickedOutside.bind(this));
            }
        };
    }

    clickedOutsideElement(element, e) {
        let eventTarget = (e.target) ? e.target : e.srcElement;
        while (eventTarget != null) {
            if (eventTarget === element) {
                return false;
            }
            eventTarget = eventTarget.offsetParent;
        }
        return true;
    }

    componentWillMount() {
        this.bindEvents();

        const { options } = this.props;
        let value = this.props.value || this.props.defaultValue;
        this.setState({
            all: options,
            filterValue: value || '',
            options: value ? this.filterOptions(options, value) : options
        });
    }

    componentWillReceiveProps(nextProps) {
        const { options } = nextProps;
        if (JSON.stringify(options) !== JSON.stringify(this.props.options)) {
            let value = nextProps.value || nextProps.defaultValue;
            this.setState({
                all: options,
                filterValue: value || '',
                options: value ? this.filterOptions(options, value) : options
            });
        }
    }

    focusNextOption() {
        this.focusAdjacentOption('next');
    }

    focusPreviousOption() {
        this.focusAdjacentOption('previous');
    }

    focusAdjacentOption(dir) {
        const { options, isOpen, focusedOption } = this.state;

        let ops = options.filter(op => !op.disabled);
        if (!ops.length) {
            return;
        }

        if (!isOpen) {
            this.setState({
                isOpen: true,
                focusedOption: focusedOption || ops[dir === 'next' ? 0 : ops.length - 1]
            }, this._bindCloseMenuIfClickedOutside.bind(this));
            return;
        }

        let focusedIndex = -1;
        for (let i = 0; i < ops.length; i++) {
            if (focusedOption === ops[i]) {
                focusedIndex = i;
                break;
            }
        }

        let focused = ops[0];
        if (dir === 'next' && focusedIndex > -1 && focusedIndex < ops.length - 1) {
            focused = ops[focusedIndex + 1];
        } else if (dir === 'previous') {
            focused = focusedIndex > 0 ? ops[focusedIndex - 1] : ops[ops.length - 1];
        }

        this.setState({
            focusedOption: focused
        });
    }

    filterOptions(options, value) {
        const { matchPos, matchProp, ignoreCase, valueKey, labelKey } = this.props;

        return options.filter(op => {
            let valueTest = String(op[valueKey]);
            let labelTest = String(op[labelKey]);

            if (ignoreCase) {
                valueTest = valueTest.toLowerCase();
                labelTest = labelTest.toLowerCase();
                value = value.toLowerCase();
            }

            if (!value || (matchPos === 'start')) {
                return (matchProp !== 'label' && valueTest.substr(0, value.length) === value)
                    || (matchProp !== 'value' && labelTest.substr(0, value.length) === value);
            } else {
                return (matchProp !== 'label' && valueTest.indexOf(value) >= 0)
                    || (matchProp !== 'value' && labelTest.indexOf(value) >= 0);
            }
        });
    }

    isLoading() {
        return this.state.isLoading || this.props.isLoading;
    }

    renderOption(option, key) {
        const { valueKey, labelKey, optionComponent } = this.props;
        const { focusedOption } = this.state;

        return React.createElement(optionComponent, {
            key, option, labelKey,
            isFocused: focusedOption && focusedOption[valueKey] == option[valueKey],
            disabled: Boolean(option.disabled),
            onClick: this.selectOption.bind(this, option),
            onMouseOver: this.focusOption.bind(this, option)
        })
    }

    renderMenu() {
        const { loadingText } = this.props;
        const { options } = this.state;

        if (this.isLoading()) {
            return <div className="loading">{loadingText}</div>;
        } else if (options.length > 0) {
            return this.renderOptions();
        }

        return null;
    }

    renderOptions() {
        return this.state.options.map((item, index) => this.renderOption(item, index));
    }

    focusOption(focusedOption) {
        if (focusedOption.disabled) {
            return;
        }

        this.setState({
            focusedOption
        });
    }

    selectOption(currentOption) {
        if (currentOption.disabled) {
            return;
        }

        const { valueKey } = this.props;

        this.setState({
            all: [],
            options: [],
            filterValue: currentOption[valueKey],
            isOpen: false
        }, () => {
            this._unbindCloseMenuIfClickedOutside();
            this.fireChangeEvent(currentOption[valueKey], currentOption, this.state.options);
        });
    }

    selectFocusedOption() {
        if (this.state.focusedOption) {
            this.selectOption(this.state.focusedOption);
        }
    }

    fireChangeEvent(value, option, options) {
        if (this.props.onChange) {
            this.props.onChange(value, option, options);
        }
    }

    update(options) {
        this.setState({
            all: options,
            options
        });
    }

    handleKeyDown(e) {
        const { filterValue, isOpen, focusedOption } = this.state;

        if (this.props.disabled) {
            return;
        }

        switch (e.keyCode) {
            case 9: // tab
                if (e.shiftKey || filterValue.length > 0 || !isOpen || !focusedOption) {
                    return;
                }
                this.selectFocusedOption();
                break;
            case 13: // enter
                if (!isOpen) {
                    return;
                }
                this.selectFocusedOption();
                break;
            case 27: // escape
                if (isOpen) {
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

    handleOnClickWrapper(e) {
        const { isOpen, options, filterValue } = this.state;
        const { valueKey } = this.props;

        clearTimeout(this._timer);
        if (!isOpen && !this.isLoading() && options.length > 0) {
            this.setState({
                isOpen: options.filter(obj => obj[valueKey] != filterValue).length > 0
            }, this._bindCloseMenuIfClickedOutside.bind(this));
        }
    }

    handleFilterOptions(e) {
        if ([9, 18, 13, 27].indexOf(e.keyCode) > -1) {
            return;
        }

        const { all } = this.state;

        if (e.target.value == this.state.filterValue) {
            return;
        }

        let filterValue = e.target.value;
        this.setState({
            filterValue
        }, () => {
            const { isAsync, onInputChange, onChangeInterval, minFilterLength } = this.props;
            if (isAsync && onInputChange) {
                clearTimeout(this._timer);

                if (filterValue.length < minFilterLength) {
                    this.setState({
                        all: [],
                        options: [],
                        isLoading: false
                    });
                } else {
                    this._timer = setTimeout(() => {
                        this.setState({
                            isLoading: true
                        }, () => {
                            let promise = onInputChange(filterValue);
                            if (typeof promise === "object") {
                                promise.then(options => {
                                    this.setState({
                                        options,
                                        isOpen: this.state.isFocused && options.length > 0,
                                        all: [],
                                        isLoading: false
                                    });
                                });
                            } else {
                                this.setState({
                                    all: [],
                                    options: [],
                                    isLoading: false
                                });
                            }
                        });
                    }, onChangeInterval);
                }
            } else {
                let filteredOptions = this.filterOptions(all, filterValue);
                this.setState({
                    options: filteredOptions,
                    isOpen: filteredOptions.length > 0
                });
            }
        });
    }

    searchOnBlur(e) {
        clearTimeout(this._timer);

        this.setState({
            isFocused: false
        });
    }

    searchOnFocus(e) {
        const { options, filterValue } = this.state;
        const { valueKey } = this.props;

        this.setState({
            isFocused: true,
            isOpen: filterValue.length > 0 && options.filter(obj => obj[valueKey] != filterValue).length > 0
        });
    }

    renderSearchInput() {
        const { name, id } = this.props;

        return (
            <div className="search-input">
                <input ref="searchInput"
                       type="text"
                       placeholder="Поиск..."
                       autoComplete="off"
                       value={this.state.filterValue}
                       name={name}
                       id={id}
                       onFocus={this.searchOnFocus.bind(this)}
                       onBlur={this.searchOnBlur.bind(this)}
                       onChange={this.handleFilterOptions.bind(this)}/>
            </div>
        );
    }

    render() {
        return (
            <div ref="control"
                 tabIndex="1"
                 onKeyDown={this.handleKeyDown.bind(this)}
                 className="select-container">

                <div className="select-input autocomplete"
                     onClick={this.handleOnClickWrapper.bind(this)}>
                    <div className={"select-spinner" + (this.isLoading() ? "" : " hide")}></div>

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
