'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const orders = require('../lib/orders');
const ledger = require('../lib/ledger');

const historyOrders = [
  { id: 1001, date: '28/12/2021' },
  { id: 1004, date: '30/01/2022' },
  { id: 1008, date: '15/03/2022' }
];

test('order history sorts dates newest first across months and years', function () {
  const listed = orders.list({ orders: historyOrders });

  assert.deepEqual(listed.map(function (order) { return order.id; }), [1008, 1004, 1001]);
});

test('date range filtering returns only orders within the requested dates', function () {
  const listed = orders.list({ orders: historyOrders }, {
    from: '2022-03-01',
    to: '2022-03-31'
  });

  assert.deepEqual(listed.map(function (order) { return order.id; }), [1008]);
});

test('Khata settlement adds a string amount numerically and recalculates balance', function () {
  const db = {
    customers: [{
      id: 1,
      name: 'Meera Joshi',
      openingBalance: 450,
      totalBilled: 1982.01,
      totalSettled: 1200,
      balance: 1232.01
    }],
    nextSettlementId: 505,
    settlements: []
  };

  const result = ledger.recordSettlement(db, 1, '500', 'upi', 'In-memory test');

  assert.equal(result.ok, true);
  assert.equal(result.customer.totalSettled, 1700);
  assert.equal(result.customer.balance, 732.01);
  assert.equal(result.settlement.amount, 500);
  assert.equal(ledger.listCustomers(db)[0].balance, 732.01);
});
