'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const inventory = require('../lib/inventory');
const orders = require('../lib/orders');

test('inventory allows an order for exactly the sellable stock', function () {
  const products = [
    { id: 1, name: 'Ghee', stock: 1, reserved: 0 },
    { id: 2, name: 'Chilli', stock: 4, reserved: 3 }
  ];

  assert.deepEqual(inventory.check(products, [
    { id: 1, qty: 1 },
    { id: 2, qty: 1 }
  ]), { ok: true });
});

test('cancelling an order restores its physical stock', function () {
  const db = {
    products: [
      { id: 1, name: 'Ghee', stock: 1, reserved: 0 },
      { id: 2, name: 'Sunflower Oil', stock: 20, reserved: 2 }
    ],
    orders: [{
      id: 1007,
      status: 'pending',
      paymentMode: 'cash',
      items: [
        { id: 1, name: 'Ghee', qty: 1 },
        { id: 2, name: 'Sunflower Oil', qty: 2 }
      ],
      total: 450
    }],
    customers: []
  };

  const result = orders.cancel(db, 1007, 'Inventory cancellation test');

  assert.equal(result.ok, true);
  assert.equal(result.order.status, 'cancelled');
  assert.equal(db.products[0].stock, 2);
  assert.equal(db.products[0].reserved, 0);
  assert.equal(db.products[1].stock, 22);
  assert.equal(db.products[1].reserved, 2);
});
