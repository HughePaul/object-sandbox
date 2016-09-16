'use strict';

module.exports = {
    create() {
        let sandbox = {
            restorers: [],
            add(object) {
                let descriptors = {};

                for (let k of Object.getOwnPropertyNames(object)) {
                    descriptors[k] = Object.getOwnPropertyDescriptor(object, k);
                }

                let restore = () => {
                    for (let k of Object.getOwnPropertyNames(object)) {
                        if (!descriptors[k]) {
                            delete object[k];
                        }
                    }
                    for (let k in descriptors) {
                        if (descriptors[k] && descriptors[k] !== Object.getOwnPropertyDescriptor(object, k)) {
                            Object.defineProperty(object, k, descriptors[k]);
                        }
                    }
                };

                sandbox.restorers.push(restore);
            },

            restore() {
                sandbox.restorers.forEach(f => f());
            }
        };

        Array.prototype.slice.call(arguments).forEach(sandbox.add);

        return sandbox;
    }
}
