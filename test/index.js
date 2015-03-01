#!/usr/bin/env node


test('universe');


function test(filename) {
  require('./test_' + filename + '.js');
}