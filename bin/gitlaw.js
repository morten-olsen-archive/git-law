#!/usr/bin/env Node
require('dotenv').config();
try {
  require('ts-node/register');
} catch (err) {}
require('../dist/bin');
