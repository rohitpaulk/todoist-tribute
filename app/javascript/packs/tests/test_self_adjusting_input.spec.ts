require('jsdom-global')()

import assert = require('assert');
import 'mocha';
import Vue from 'vue/dist/vue.common.js';

import Sinon from 'sinon';

import {
    SelfAdjustingInput, SelfAdjustingInputOptions
} from '../components/self_adjusting_input';

function boundingRectWithWidth(width: number): ClientRect {
    return {
        width: width,
        bottom: 20,
        height: 20,
        left: 20,
        right: 20,
        top: 20
    };
}

describe('Self Adjusting Input', function() {
    it('should compute lastKnownWidth', function(done) {
        let fakeWidth = 20;
        let getBoundingRect = function() {
            return boundingRectWithWidth(fakeWidth);
        }

        let fake = Sinon.fake(getBoundingRect);
        Element.prototype.getBoundingClientRect = fake;

        let Component = Vue.extend(SelfAdjustingInputOptions);
        let instance = new Component({
            propsData: {
                value: "testing"
            }
        }).$mount();

        assert.equal(1, fake.callCount);
        assert.equal(instance.lastKnownWidth, 20);

        fakeWidth = 22;

        instance.value = "testing2";
        instance.$nextTick(function() {
            assert.equal(instance.lastKnownWidth, 22);
            assert.equal(2, fake.callCount);
            done();
        });
    });
});
