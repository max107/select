import React, { Component, PropTypes } from 'react';
import Select from './select';
import shallowequal from 'shallowequal';

export default class SelectAsync extends Component {
    static propTypes = {
        actions: PropTypes.object.isRequired,
        params: PropTypes.object,
        isAsync: PropTypes.bool,
        prepend: PropTypes.array,
        append: PropTypes.array,
        objects: PropTypes.array.isRequired
    };

    static defaultProps = {
        isAsync: false,
        params: {},
        objects: [],
        prepend: [],
        append: []
    };

    componentWillMount() {
        const { isAsync, actions, params } = this.props;
        if (isAsync === false) {
            actions.fetchOptionsIfNeeded(params);
        }
    }

    componentWillReceiveProps(nextProps) {
        const { actions, params, isAsync } = nextProps;
        if (isAsync && shallowequal(params, this.props.params) === false) {
            actions.fetchOptions(params);
        }
    }

    getNewProps() {
        let props = this.props;
        let newProps = {...props};
        delete newProps['objects'];
        delete newProps['loading'];
        return newProps;
    }

    onInputChange(value) {
        const { wrapper, params } = this.props;
        return wrapper.select({
            ...params,
            q: value
        }).then(data => data.objects);
    }

    preloadSingleOption(value) {
        const { wrapper, params } = this.props;
        return wrapper.select({
            ...params,
            id: value
        }).then(data => {
            if (data.objects.length > 0) {
                return data.objects[0];
            } else {
                return null;
            }
        });
    }

    render() {
        const { isAsync, objects, loading, prepend, append } = this.props;
        let options = isAsync ? objects : [...prepend, ...objects, ...append];
        return <Select
            {...this.getNewProps()}
            preloadSingleOption={isAsync ? this.preloadSingleOption.bind(this) : null}
            onInputChange={isAsync ? this.onInputChange.bind(this) : null}
            options={options}
            isLoading={loading} />;
    }
}