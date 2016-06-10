/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 03/06/16
 * Time: 13:08
 */
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import CurrentValue from './current_value';
import CurrentPlaceholder from './current_placeholder';
import Option from './option';

export default class SelectBase extends Component {
    _timer = null;

    static propTypes = {
        isAsync: PropTypes.bool,
        options: PropTypes.array,
        valueKey: PropTypes.string,
        labelKey: PropTypes.string,
        defaultValue: PropTypes.any,
        value: PropTypes.any,
        placeholder: PropTypes.string,
        optionComponent: PropTypes.func,
        noResults: PropTypes.string,
        noResultsAsync: PropTypes.string,
        minFilterText: PropTypes.string,
        loadingText: PropTypes.string,
        createText: PropTypes.string,
        onChangeInterval: PropTypes.number,
        minFilterLength: PropTypes.number,
        clearable: PropTypes.bool,
        ignoreCase: PropTypes.bool,
        isLoading: PropTypes.bool,
        enableSearch: PropTypes.bool,
        onChange: PropTypes.func,
        onInputChange: PropTypes.func,
        preload: PropTypes.func,
        currentValueComponent: PropTypes.func,
        currentPlaceholderComponent: PropTypes.func,
        onCreate: PropTypes.func
    };

    static defaultProps = {
        isAsync: false,
        options: [],
        minFilterText: 'Минимум символов для поиска:',
        placeholder: 'Выбор...',
        loadingText: 'Поиск...',
        noResults: 'Результаты отсутствуют',
        noResultsAsync: 'Результаты отсутствуют. Введите текст для поиска...',
        createText: 'Добавить?',
        valueKey: 'value',
        labelKey: 'label',
        enableSearch: true,
        minFilterLength: 3,
        onChangeInterval: 350,
        preload: undefined,
        onChange: undefined,
        onInputChange: undefined,
        optionComponent: Option,
        currentValueComponent: CurrentValue,
        currentPlaceholderComponent: CurrentPlaceholder,
        isLoading: false,
        clearable: true,
        ignoreCase: true,
        defaultValue: undefined,
        value: undefined,
        onCreate: undefined
    };

    state = {
        all: [],
        isFocused: false,
        filterValue: '',
        stateMessage: undefined,
        isLoading: false,
        options: [],
        focusedOption: {},
        currentOption: {},
        isOpen: false
    };

    preload(value) {
        this.setState({
            isLoading: true
        }, () => {
            let promise = this.props.preload(value);
            if (typeof promise === 'object') {
                promise.then(option => {
                    this.setState({
                        currentOption: option || {},
                        isLoading: false
                    });
                });
            } else {
                this.setState({
                    isLoading: false
                });
            }
        });
    }

    clearInputValue() {
        ReactDOM.findDOMNode(this.refs.searchInput).value = '';
    }

    componentWillMount() {
        const { isAsync, preload }  = this.props;
        let value = this.props.value || this.props.defaultValue;
        if (value && isAsync && preload) {
            this.preload(value);
        }

        this._closeMenuIfClickedOutside = (e) => {
            if (!this.state.isOpen) {
                return;
            }
            let menuElem = ReactDOM.findDOMNode(this.refs.selectMenuContainer);
            let controlElem = ReactDOM.findDOMNode(this.refs.control);

            let eventOccuredOutsideMenu = this.clickedOutsideElement(menuElem, e);
            let eventOccuredOutsideControl = this.clickedOutsideElement(controlElem, e);

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

            if (this.refs.searchInput) {
                this.refs.searchInput.focus();
            }
        };
        this._unbindCloseMenuIfClickedOutside = () => {
            if (!document.removeEventListener && document.detachEvent) {
                document.detachEvent('onclick', this._closeMenuIfClickedOutside.bind(this));
            } else {
                document.removeEventListener('click', this._closeMenuIfClickedOutside.bind(this));
            }
        };
    }

    componentWillReceiveProps(nextProps) {
        const { options } = nextProps;
        if (JSON.stringify(options) !== JSON.stringify(this.props.options)) {
            let value = nextProps.value || nextProps.defaultValue;
            this.setState({
                all: options,
                options,
                currentOption: this.findOptionByValue(value, options)
            });
        }
    }

    findOptionByValue(value, options) {
        const { valueKey } = this.props;
        options = options || this.props.options;
        for (let key in options) {
            if (options[key][valueKey] == value) {
                return options[key];
            }
        }

        return {};
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

    focusNextOption() {
        this.focusAdjacentOption('next');
    }

    focusPreviousOption() {
        this.focusAdjacentOption('previous');
    }

    focusAdjacentOption(dir) {
        let ops = this.state.options.filter(op => !op.disabled);
        if (!ops.length) {
            return;
        }
        if (!this.state.isOpen) {
            this.setState({
                isOpen: true,
                focusedOption: this.state.focusedOption || ops[dir === 'next' ? 0 : ops.length - 1]
            }, this._bindCloseMenuIfClickedOutside.bind(this));
            return;
        }
        let focusedIndex = -1;
        for (let i = 0; i < ops.length; i++) {
            if (this.state.focusedOption === ops[i]) {
                focusedIndex = i;
                break;
            }
        }
        let focusedOption = ops[0];
        if (dir === 'next' && focusedIndex > -1 && focusedIndex < ops.length - 1) {
            focusedOption = ops[focusedIndex + 1];
        } else if (dir === 'previous') {
            if (focusedIndex > 0) {
                focusedOption = ops[focusedIndex - 1];
            } else {
                focusedOption = ops[ops.length - 1];
            }
        }
        this.setState({
            focusedOption
        });
    }

    handleOnClickWrapper(e) {
        const { isOpen, filterValue, stateMessage } = this.state;
        if (!isOpen && !this.isLoading()) {
            this.setState({
                stateMessage: filterValue.length == 0 ? undefined : stateMessage,
                isOpen: true
            }, this._bindCloseMenuIfClickedOutside.bind(this));
        }
    }

    render() {
        return null;
    }

    filterOptions(value) {
        const { matchPos, matchProp, ignoreCase, valueKey, labelKey } = this.props;
        const { all } = this.state;

        return all.filter(op => {
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

    handleFilterOptions(e) {
        if ([18, 13, 27].indexOf(e.keyCode) > -1) {
            return;
        }

        const { onCreate } = this.props;
        const { filterValue } = this.state;

        const { isAsync, onInputChange, onChangeInterval, minFilterLength, minFilterText } = this.props;
        if (isAsync && onInputChange) {
            clearTimeout(this._timer);

            if (filterValue.length < minFilterLength) {
                this.setState({
                    stateMessage: minFilterText + ' ' + minFilterLength,
                    all: [],
                    options: [],
                    isLoading: false
                });
            } else {
                this._timer = setTimeout(() => {
                    this.setState({
                        stateMessage: undefined,
                        isLoading: true
                    }, () => {
                        let promise = onInputChange(filterValue);
                        if (typeof promise === "object") {
                            promise.then(options => {
                                this.setState({
                                    options: options || [],
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
            let filteredOptions = this.filterOptions(filterValue);
            this.setState({
                stateMessage: onCreate && filterValue.length > 0 ? this.renderCreateMessage() : undefined,
                options: filteredOptions
            });
        }
    }

    handleCreate(value, e) {
        e.preventDefault();
    }

    renderCreateMessage() {
        const { createText } = this.props;
        return <span onClick={this.handleCreate.bind(this)}
                     className="select-create-input">{createText}</span>;
    }

    clearValue() {
        this.setState({
            currentOption: {}
        }, this.fireChangeEvent.bind(this));
    }

    renderClear() {
        const { clearable, clearValueText, disabled } = this.props;
        const { currentOption } = this.state;

        if (disabled || this.isLoading() || !clearable || !currentOption.value) {
            return null;
        }

        return (
            <span
                className="select-clear-zone"
                title={clearValueText}
                aria-label={clearValueText}
                onMouseDown={this.clearValue.bind(this)}
                onClick={this.clearValue.bind(this)}>
                <span className="select-clear">&times;</span>
            </span>
        );
    }

    renderSearchInput() {
        const { enableSearch } = this.props;

        if (enableSearch === false) {
            return null;
        }

        return (
            <div className="search-input">
                <input ref="searchInput" type="text" placeholder="Поиск..." autoComplete="off"
                       value={this.state.filterValue}
                       onChange={e => this.setState({filterValue: e.target.value})}
                       onKeyUp={this.handleFilterOptions.bind(this)}/>
            </div>
        );
    }

    renderOption(option, key) {
        const { valueKey, labelKey, optionComponent } = this.props;

        let isFocused = this.state.focusedOption && this.state.focusedOption[valueKey] == option[valueKey];

        return React.createElement(optionComponent, {
            key, isFocused, option, labelKey,
            onClick: option.disabled ? null : this.selectOption.bind(this, option),
            onMouseOver: option.disabled ? null : this.focusOption.bind(this, option),
            disabled: Boolean(option.disabled)
        })
    }

    renderMenu() {
        const { isAsync, noResults, noResultsAsync, loadingText } = this.props;
        const { stateMessage, options } = this.state;

        if (this.isLoading()) {
            return <div className="loading">{loadingText}</div>
        } else if (options.length > 0) {
            return this.renderOptions();
        } else if (stateMessage) {
            return <div className="no-results">{stateMessage}</div>;
        } else if (isAsync && options.length == 0) {
            return <div className="no-results">{noResultsAsync}</div>;
        } else {
            return <div className="no-results">{noResults}</div>;
        }
    }

    renderOptions() {
        return this.state.options.map((item, index) => this.renderOption(item, index));
    }

    focusOption(focusedOption) {
        this.setState({
            focusedOption
        });
    }

    selectOption(currentOption) {
        const { isAsync, valueKey } = this.props;
        const { options } = this.state;

        this.setState({
            currentOption,
            isOpen: false
        }, () => {
            this._unbindCloseMenuIfClickedOutside();
            this.fireChangeEvent(currentOption[valueKey], currentOption, isAsync ? this.state.options : options);
        });
    }

    selectFocusedOption() {
        if (this.state.focusedOption) {
            this.selectOption(this.state.focusedOption);
        }
    }

    fireChangeEvent(value, option, options) {
        if (this.props.onChange) {
            this.props.onChange(value || '', option, options);
        }
    }

    update(options) {
        this.setState({
            options
        });
    }
}
