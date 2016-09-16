# object-sandbox
Save and restore definition of Nodejs objects to allow stubbing of properties, methods, getters, and setters during testing.

## Usage
Sandbox objects
```
let obj1 = {
    method() { console.log('original'); }
};
let obj2 = {
    foo: 'bar'
};

const objectSandbox = require('object-sandbox');
let sandbox = objectSandbox.create(obj1, obj2);
```
Sandbox addtional objects
```
let obj3 = { another: 'object' };
sandbox.add(obj3);
```
Change object properties
```
obj1.method = () => console.log('stubbed');
obj2.foo = 'rab';

obj1.method(); // stubbed
obj2.foo === 'rab' // true
```
Restore all objects in the sandbox
```
sandbox.restore(); 

obj1.method(); // original
obj2.foo === 'bar' // true
```

This can be used to sandbox and resture objects with sinon stubbed getters and setters, as sinon doesn't support restoring getters yet (<2.0.0), as it tries to run the getter while restoring.

```
const sinon = require('sinon');
require('chai').should();

const objectSandbox = require('object-sandbox');

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
};

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
    })

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
```


