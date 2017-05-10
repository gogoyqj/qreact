import { h, render, rerender, Component } from '../../src/preact';
/** @jsx h */

let spyAll = obj => Object.keys(obj).forEach( key => sinon.spy(obj,key) );

const EMPTY_CHILDREN = undefined;//[];

describe('Lifecycle methods', () => {
    let scratch;

    before( () => {
        scratch = document.createElement('div');
        (document.body || document.documentElement).appendChild(scratch);
    });

    beforeEach( () => {
        scratch.innerHTML = '';
    });

    after( () => {
        scratch.parentNode.removeChild(scratch);
        scratch = null;
    });


    describe('#componentWillUpdate', () => {
        it('should NOT be called on initial render', () => {
            class ReceivePropsComponent extends Component {
                componentWillUpdate() {}
                render() {
                    return <div />;
                }
            }
            sinon.spy(ReceivePropsComponent.prototype, 'componentWillUpdate');
            render(<ReceivePropsComponent />, scratch);
            expect(ReceivePropsComponent.prototype.componentWillUpdate).not.to.have.been.called;
        });

        it('should be called when rerender with new props from parent', () => {
            let doRender;
            class Outer extends Component {
                constructor(p, c) {
                    super(p, c);
                    this.state = { i: 0 };
                }
                componentDidMount() {
                    doRender = () => this.setState({ i: this.state.i + 1 });
                }
                render(props, { i }) {
                    return <Inner i={i} {...props} />;
                }
            }
            class Inner extends Component {
                componentWillUpdate(nextProps, nextState) {
                    expect(nextProps).to.be.deep.equal({i: 1 });
                    expect(nextState).to.be.deep.equal({});
                }
                render() {
                    return <div />;
                }
            }
            sinon.spy(Inner.prototype, 'componentWillUpdate');
            sinon.spy(Outer.prototype, 'componentDidMount');

            // Initial render
            render(<Outer />, scratch);
            expect(Inner.prototype.componentWillUpdate).not.to.have.been.called;

            // Rerender inner with new props
            doRender();
            rerender();
            expect(Inner.prototype.componentWillUpdate).to.have.been.called;
        });

        it('should be called on new state', () => {
            let doRender;
            class ReceivePropsComponent extends Component {
                componentWillUpdate() {}
                componentDidMount() {
                    doRender = () => this.setState({ i: this.state.i + 1 });
                }
                render() {
                    return <div />;
                }
            }
            sinon.spy(ReceivePropsComponent.prototype, 'componentWillUpdate');
            render(<ReceivePropsComponent />, scratch);
            expect(ReceivePropsComponent.prototype.componentWillUpdate).not.to.have.been.called;

            doRender();
            rerender();
            expect(ReceivePropsComponent.prototype.componentWillUpdate).to.have.been.called;
        });
    });

    describe('#componentWillReceiveProps', () => {
        it('should NOT be called on initial render', () => {
            class ReceivePropsComponent extends Component {
                componentWillReceiveProps() {}
                render() {
                    return <div />;
                }
            }
            sinon.spy(ReceivePropsComponent.prototype, 'componentWillReceiveProps');
            render(<ReceivePropsComponent />, scratch);
            expect(ReceivePropsComponent.prototype.componentWillReceiveProps).not.to.have.been.called;
        });

        it('should be called when rerender with new props from parent', () => {
            let doRender;
            class Outer extends Component {
                constructor(p, c) {
                    super(p, c);
                    this.state = { i: 0 };
                }
                componentDidMount() {
                    doRender = () => this.setState({ i: this.state.i + 1 });
                }
                render(props, { i }) {
                    return <Inner i={i} {...props} />;
                }
            }
            class Inner extends Component {
                componentWillMount() {
                    expect(this.props.i).to.be.equal(0);
                }
                componentWillReceiveProps(nextProps) {
                    expect(nextProps.i).to.be.equal(1);
                }
                render() {
                    return <div />;
                }
            }
            sinon.spy(Inner.prototype, 'componentWillReceiveProps');
            sinon.spy(Outer.prototype, 'componentDidMount');

            // Initial render
            render(<Outer />, scratch);
            expect(Inner.prototype.componentWillReceiveProps).not.to.have.been.called;

            // Rerender inner with new props
            doRender();
            rerender();
            expect(Inner.prototype.componentWillReceiveProps).to.have.been.called;
        });

        it('should be called in right execution order', () => {
            let doRender;
            class Outer extends Component {
                constructor(p, c) {
                    super(p, c);
                    this.state = { i: 0 };
                }
                componentDidMount() {
                    doRender = () => this.setState({ i: this.state.i + 1 });
                }
                render(props, { i }) {
                    return <Inner i={i} {...props} />;
                }
            }
            class Inner extends Component {
                componentDidUpdate() {
                    expect(Inner.prototype.componentWillReceiveProps).to.have.been.called;
                    expect(Inner.prototype.componentWillUpdate).to.have.been.called;
                }
                componentWillReceiveProps() {
                    expect(Inner.prototype.componentWillUpdate).not.to.have.been.called;
                    expect(Inner.prototype.componentDidUpdate).not.to.have.been.called;
                }
                componentWillUpdate() {
                    expect(Inner.prototype.componentWillReceiveProps).to.have.been.called;
                    expect(Inner.prototype.componentDidUpdate).not.to.have.been.called;
                }
                render() {
                    return <div />;
                }
            }
            sinon.spy(Inner.prototype, 'componentWillReceiveProps');
            sinon.spy(Inner.prototype, 'componentDidUpdate');
            sinon.spy(Inner.prototype, 'componentWillUpdate');
            sinon.spy(Outer.prototype, 'componentDidMount');

            render(<Outer />, scratch);
            doRender();
            rerender();

            expect(Inner.prototype.componentWillReceiveProps).to.have.been.calledBefore(Inner.prototype.componentWillUpdate);
            expect(Inner.prototype.componentWillUpdate).to.have.been.calledBefore(Inner.prototype.componentDidUpdate);
        });
    });


    describe('top-level componentWillUnmount', () => {
        it('should invoke componentWillUnmount for top-level components', () => {
            class Foo extends Component {
                componentDidMount() {}
                componentWillUnmount() {}
            }
            class Bar extends Component {
                componentDidMount() {}
                componentWillUnmount() {}
            }
            spyAll(Foo.prototype);
            spyAll(Bar.prototype);

            render(<Foo />, scratch, scratch.lastChild);
            expect(Foo.prototype.componentDidMount, 'initial render').to.have.been.calledOnce;

            render(<Bar />, scratch, scratch.lastChild);
            expect(Foo.prototype.componentWillUnmount, 'when replaced').to.have.been.calledOnce;
            expect(Bar.prototype.componentDidMount, 'when replaced').to.have.been.calledOnce;

            render(<div />, scratch, scratch.lastChild);
            expect(Bar.prototype.componentWillUnmount, 'when removed').to.have.been.calledOnce;
        });
    });


    let _it = it;
    describe('#constructor and component(Did|Will)(Mount|Unmount)', () => {
        /* global DISABLE_FLAKEY */
        let it = DISABLE_FLAKEY ? xit : _it;

        let setState;
        class Outer extends Component {
            constructor(p, c) {
                super(p, c);
                this.state = { show:true };
                setState = s => this.setState(s);
            }
            render(props, { show }) {
                return (
                    <div>
                        { show && (
                            <Inner {...props} />
                        ) }
                    </div>
                );
            }
        }

        class LifecycleTestComponent extends Component {
            constructor(p, c) { super(p, c); this._constructor(); }
            _constructor() {}
            componentWillMount() {}
            componentDidMount() {}
            componentWillUnmount() {}
            componentDidUnmount() {}
            render() { return <div />; }
        }

        class Inner extends LifecycleTestComponent {
            render() {
                return (
                    <div>
                        <InnerMost />
                    </div>
                );
            }
        }

        class InnerMost extends LifecycleTestComponent {
            render() { return <div />; }
        }

        let spies = ['_constructor', 'componentWillMount', 'componentDidMount', 'componentWillUnmount', 'componentDidUnmount'];

        let verifyLifycycleMethods = (TestComponent) => {
            let proto = TestComponent.prototype;
            spies.forEach( s => sinon.spy(proto, s) );
            let reset = () => spies.forEach( s => proto[s].reset() );

            it('should be invoked for components on initial render', () => {
                reset();
                render(<Outer />, scratch);
                expect(proto._constructor).to.have.been.called;
                expect(proto.componentDidMount).to.have.been.called;
                expect(proto.componentWillMount).to.have.been.calledBefore(proto.componentDidMount);
                expect(proto.componentDidMount).to.have.been.called;
            });

            it('should be invoked for components on unmount', () => {
                reset();
                setState({ show:false });
                rerender();

                expect(proto.componentDidUnmount).to.have.been.called;
                expect(proto.componentWillUnmount).to.have.been.calledBefore(proto.componentDidUnmount);
                expect(proto.componentDidUnmount).to.have.been.called;
            });

            it('should be invoked for components on re-render', () => {
                reset();
                setState({ show:true });
                rerender();

                expect(proto._constructor).to.have.been.called;
                expect(proto.componentDidMount).to.have.been.called;
                expect(proto.componentWillMount).to.have.been.calledBefore(proto.componentDidMount);
                expect(proto.componentDidMount).to.have.been.called;
            });
        };

        describe('inner components', () => {
            verifyLifycycleMethods(Inner);
        });

        describe('innermost components', () => {
            verifyLifycycleMethods(InnerMost);
        });

        describe('when shouldComponentUpdate() returns false', () => {
            let setState;

            class Outer extends Component {
                constructor() {
                    super();
                    this.state = { show:true };
                    setState = s => this.setState(s);
                }
                render(props, { show }) {
                    return (
                        <div>
                            { show && (
                                <div>
                                    <Inner {...props} />
                                </div>
                            ) }
                        </div>
                    );
                }
            }

            class Inner extends Component {
                shouldComponentUpdate(){ return false; }
                componentWillMount() {}
                componentDidMount() {}
                componentWillUnmount() {}
                componentDidUnmount() {}
                render() {
                    return <div />;
                }
            }

            let proto = Inner.prototype;
            let spies = ['componentWillMount', 'componentDidMount', 'componentWillUnmount', 'componentDidUnmount'];
            spies.forEach( s => sinon.spy(proto, s) );

            let reset = () => spies.forEach( s => proto[s].reset() );

            beforeEach( () => reset() );

            it('should be invoke normally on initial mount', () => {
                render(<Outer />, scratch);
                expect(proto.componentWillMount).to.have.been.called;
                expect(proto.componentWillMount).to.have.been.calledBefore(proto.componentDidMount);
                expect(proto.componentDidMount).to.have.been.called;
            });

            it('should be invoked normally on unmount', () => {
                setState({ show:false });
                rerender();

                expect(proto.componentWillUnmount).to.have.been.called;
                expect(proto.componentWillUnmount).to.have.been.calledBefore(proto.componentDidUnmount);
                expect(proto.componentDidUnmount).to.have.been.called;
            });

            it('should still invoke mount for shouldComponentUpdate():false', () => {
                setState({ show:true });
                rerender();

                expect(proto.componentWillMount).to.have.been.called;
                expect(proto.componentWillMount).to.have.been.calledBefore(proto.componentDidMount);
                expect(proto.componentDidMount).to.have.been.called;
            });

            it('should still invoke unmount for shouldComponentUpdate():false', () => {
                setState({ show:false });
                rerender();

                expect(proto.componentWillUnmount).to.have.been.called;
                expect(proto.componentWillUnmount).to.have.been.calledBefore(proto.componentDidUnmount);
                expect(proto.componentDidUnmount).to.have.been.called;
            });
        });
    });

    describe('Lifecycle DOM Timing', () => {
        it('should be invoked when dom does (DidMount, WillUnmount) or does not (WillMount, DidUnmount) exist', () => {
            let setState;
            class Outer extends Component {
                constructor() {
                    super();
                    this.state = { show:true };
                    setState = s => {
                        this.setState(s);
                        this.forceUpdate();
                    };
                }
                componentWillMount() {
                    expect(document.getElementById('OuterDiv'), 'Outer componentWillMount').to.not.exist;
                }
                componentDidMount() {
                    expect(document.getElementById('OuterDiv'), 'Outer componentDidMount').to.exist;
                }
                componentWillUnmount() {
                    expect(document.getElementById('OuterDiv'), 'Outer componentWillUnmount').to.exist;
                }
                componentDidUnmount() {
                    expect(document.getElementById('OuterDiv'), 'Outer componentDidUnmount').to.not.exist;
                }
                render(props, { show }) {
                    return (
                        <div id="OuterDiv">
                            { show && (
                                <div>
                                    <Inner {...props} />
                                </div>
                            ) }
                        </div>
                    );
                }
            }

            class Inner extends Component {
                componentWillMount() {
                    expect(document.getElementById('InnerDiv'), 'Inner componentWillMount').to.not.exist;
                }
                componentDidMount() {
                    expect(document.getElementById('InnerDiv'), 'Inner componentDidMount').to.exist;
                }
                componentWillUnmount() {
                    // @TODO Component mounted into elements (non-components)
                    // are currently unmounted after those elements, so their
                    // DOM is unmounted prior to the method being called.
                    //expect(document.getElementById('InnerDiv'), 'Inner componentWillUnmount').to.exist;
                }
                componentDidUnmount() {
                    expect(document.getElementById('InnerDiv'), 'Inner componentDidUnmount').to.not.exist;
                }

                render() {
                    return <div id="InnerDiv" />;
                }
            }

            let proto = Inner.prototype;
            let spies = ['componentWillMount', 'componentDidMount', 'componentWillUnmount', 'componentDidUnmount'];
            spies.forEach( s => sinon.spy(proto, s) );

            let reset = () => spies.forEach( s => proto[s].reset() );

            render(<Outer />, scratch);
            expect(proto.componentWillMount).to.have.been.called;
            expect(proto.componentWillMount).to.have.been.calledBefore(proto.componentDidMount);
            expect(proto.componentDidMount).to.have.been.called;

            reset();
            setState({ show:false });

            expect(proto.componentWillUnmount).to.have.been.called;
            expect(proto.componentWillUnmount).to.have.been.calledBefore(proto.componentDidUnmount);
            expect(proto.componentDidUnmount).to.have.been.called;

            reset();
            setState({ show:true });

            expect(proto.componentWillMount).to.have.been.called;
            expect(proto.componentWillMount).to.have.been.calledBefore(proto.componentDidMount);
            expect(proto.componentDidMount).to.have.been.called;
        });

        it('should remove this.base for HOC', () => {
            let createComponent = (name, fn) => {
                class C extends Component {
                    componentWillUnmount() {
                        expect(this.base, `${name}.componentWillUnmount`).to.exist;
                    }
                    componentDidUnmount() {
                        expect(this.base, `${name}.componentDidUnmount`).not.to.exist;
                    }
                    render(props) { return fn(props); }
                }
                spyAll(C.prototype);
                return C;
            };

            class Wrapper extends Component {
                render({ children }) {
                    return <div class="wrapper">{children}</div>;
                }
            }

            let One = createComponent('One', () => <Wrapper>one</Wrapper> );
            let Two = createComponent('Two', () => <Wrapper>two</Wrapper> );
            let Three = createComponent('Three', () => <Wrapper>three</Wrapper> );

            let components = [One, Two, Three];

            let Selector = createComponent('Selector', ({ page }) => {
                let Child = components[page];
                return <Child />;
            });

            class App extends Component {
                render(_, { page }) {
                    return <Selector page={page} />;
                }
            }

            let app;
            render(<App ref={ c => app=c } />, scratch);

            for (let i=0; i<20; i++) {
                app.setState({ page: i%components.length });
                app.forceUpdate();
            }
        });
    });
});
