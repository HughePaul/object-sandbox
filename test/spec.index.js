'use strict';

const sinon = require('sinon');
require('chai').should();

const objectSandbox = require('../');

describe('object-sandbox', () => {
    it('should export a create function', () => {
        objectSandbox.create.should.be.a.function;
    });

    describe('create', () => {
        it('should create an object with add and restore functions', () => {
            var s = objectSandbox.create();
            s.should.be.an.object;
            s.add.should.be.a.function;
            s.restore.should.be.a.function;
        });

        it('should sandbox no objects with no arguments', () => {
            var s = objectSandbox.create();
            s.restorers.length.should.equal(0);
        });

        it('should sandbox all arguments', () => {
            var s = objectSandbox.create({}, {}, {});
            s.restorers.length.should.equal(3);
        });
    });

    describe('add', () => {
        it('should sandbox object', () => {
            var s = objectSandbox.create();
            s.add({});
            s.add({});
            s.restorers.length.should.equal(2);
        });
    });

    describe('create and restore', () => {
        it('should sandbox and restore a given object', () => {
            var obj = { a: 1, b: 'foo', c: { hello: 'world' }};

            var s = objectSandbox.create(obj);

            obj.a = 2;
            obj.b = 'bar';
            delete obj.c;
            obj.d = 'extra';

            obj.should.deep.equal({ a: 2, b: 'bar', d: 'extra'});

            s.restore();

            obj.should.deep.equal({ a: 1, b: 'foo', c: { hello: 'world' }});
        });

        it('should sandbox and restore getters and setters on an object', () => {
            var obj = {
                get a() { return 'foo'; },
                set b(v) { obj.c = v; }
            };

            var s = objectSandbox.create(obj);

            Object.defineProperty(obj, 'a', {
                enumerable: false,
                configurable: true,
                get: () => 'bar'
            });

            Object.defineProperty(obj, 'b', {
                enumerable: false,
                configurable: true,
                set: (v) => { obj.c = 'new ' + v; }
            });

            obj.a.should.equal('bar');
            obj.c = null;
            obj.b = 'test';
            obj.c.should.equal('new test');

            s.restore();

            obj.a.should.equal('foo');
            obj.c = null;
            obj.b = 'test';
            obj.c.should.equal('test');
        });
    });

    describe('readme example', () => {

        class MyClass {
            constructor() {
                this.event = 'no event';
            }
            get prop() {
                this.event = 'original getter run';
                return 'original value';
            }
            set prop(value) {
                this.event = 'original setter run: ' + value;
            }
        }

        describe('Sandboxed object', () => {
            let sandbox, instance;

            beforeEach( () => {
                sandbox = objectSandbox.create(MyClass.prototype);
                sinon.stub(MyClass.prototype, 'prop', {
                    get() {
                        this.event = 'stubbed getter run';
                        return 'test value';
                    }
                });
                instance = new MyClass;
            });

            afterEach( () => {
                sandbox.restore();
            });

            it('returns the stubbed getter', () => {
                instance.prop.should.equal('test value');
                instance.event.should.equal('stubbed getter run');
            });

            it('runs the original setter', () => {
                instance.prop = 'new value';
                instance.event.should.equal('original setter run: new value');
            });

            it('runs the original getter when restored', () => {
                sandbox.restore();
                instance.prop.should.equal('original value');
                instance.event.should.equal('original getter run');
            });

            it('does not run any getters or setters when restoring', () => {
                sandbox.restore();
                instance.event.should.equal('no event');
            });
        });

    });

});

