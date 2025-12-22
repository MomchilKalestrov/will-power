import React from 'react';

// Source - https://stackoverflow.com/a/70179187
// Posted by Dipak
// Retrieved 2025-12-22, License - CC BY-SA 4.0

// modified for specialized use.

type Props = React.PropsWithChildren<{
    fallback: (error: any) => React.ReactNode;
}>;

class ErrorBoundary extends React.Component<Props, { error: any; props: Props; }> {
    constructor (props: Props) {
        super(props);
        this.state = {
            error: undefined,
            props
        };
    };

    componentDidCatch(error: any) {
        this.setState({
            ...this.state,
            error
        });
    };

    render() {
        return this.state.error
        ?   this.state.props.fallback(this.state.error)
        :   this.state.props.children;
    };
};

export default ErrorBoundary;