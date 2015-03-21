#!/usr/bin/env node


test('universe');
test('scrape');

function test(filename) {
  require('./test_' + filename + '.js');
}
