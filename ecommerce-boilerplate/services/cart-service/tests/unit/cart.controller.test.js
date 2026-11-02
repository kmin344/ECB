jest.mock('../../src/models/cart.model');
jest.mock('../../src/utils/logger', () => ({ info: jest.fn(), error: jest.fn() }));

const Cart = require('../../src/models/cart.model');
const controller = require('../../src/controllers/cart.controller');

const USER_ID = 'user-1';

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const mockCart = (items = []) => ({
  userId: USER_ID,
  items: items.map((i) => ({ ...i, productId: { toString: () => i.productId } })),
  save: jest.fn().mockResolvedValue(undefined),
});

const req = (overrides = {}) => ({ user: { id: USER_ID }, params: {}, body: {}, ...overrides });

beforeEach(() => jest.clearAllMocks());

describe('getCart', () => {
  it('returns 404 when the user has no cart', async () => {
    Cart.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
    const res = mockRes();

    await controller.getCart(req(), res);

    expect(Cart.findOne).toHaveBeenCalledWith({ userId: USER_ID });
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns the cart with products populated', async () => {
    const cart = mockCart([{ productId: 'p1', quantity: 1 }]);
    const populate = jest.fn().mockResolvedValue(cart);
    Cart.findOne.mockReturnValue({ populate });
    const res = mockRes();

    await controller.getCart(req(), res);

    expect(populate).toHaveBeenCalledWith('items.productId');
    expect(res.json).toHaveBeenCalledWith(cart);
  });
});

describe('addToCart', () => {
  it('creates a cart for a first-time user', async () => {
    Cart.findOne.mockResolvedValue(null);
    const created = mockCart();
    Cart.mockImplementation(() => created);
    const res = mockRes();

    await controller.addToCart(req({ body: { productId: 'p1', quantity: 2 } }), res);

    expect(Cart).toHaveBeenCalledWith({ userId: USER_ID, items: [] });
    expect(created.items).toEqual([{ productId: 'p1', quantity: 2 }]);
    expect(created.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('increases quantity when the product is already in the cart', async () => {
    const cart = mockCart([{ productId: 'p1', quantity: 2 }]);
    Cart.findOne.mockResolvedValue(cart);

    await controller.addToCart(req({ body: { productId: 'p1', quantity: 3 } }), mockRes());

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(5);
  });

  it('returns 500 and does not throw when the database fails', async () => {
    Cart.findOne.mockRejectedValue(new Error('db down'));
    const res = mockRes();

    await controller.addToCart(req({ body: { productId: 'p1', quantity: 1 } }), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('updateCartItem', () => {
  it('sets the new quantity for an item in the cart', async () => {
    const cart = mockCart([{ productId: 'p1', quantity: 2 }]);
    Cart.findOne.mockResolvedValue(cart);
    const res = mockRes();

    await controller.updateCartItem(req({ params: { productId: 'p1' }, body: { quantity: 7 } }), res);

    expect(cart.items[0].quantity).toBe(7);
    expect(cart.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(cart);
  });

  it('returns 404 when the item is not in the cart', async () => {
    const cart = mockCart([{ productId: 'p1', quantity: 2 }]);
    Cart.findOne.mockResolvedValue(cart);
    const res = mockRes();

    await controller.updateCartItem(req({ params: { productId: 'p9' }, body: { quantity: 1 } }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(cart.save).not.toHaveBeenCalled();
  });
});

describe('removeFromCart', () => {
  it('removes only the requested product', async () => {
    const cart = mockCart([
      { productId: 'p1', quantity: 1 },
      { productId: 'p2', quantity: 4 },
    ]);
    Cart.findOne.mockResolvedValue(cart);

    await controller.removeFromCart(req({ params: { productId: 'p1' } }), mockRes());

    expect(cart.items.map((i) => i.productId.toString())).toEqual(['p2']);
    expect(cart.save).toHaveBeenCalled();
  });
});

describe('clearCart', () => {
  it('empties the cart', async () => {
    const cart = mockCart([{ productId: 'p1', quantity: 1 }]);
    Cart.findOne.mockResolvedValue(cart);
    const res = mockRes();

    await controller.clearCart(req(), res);

    expect(cart.items).toEqual([]);
    expect(res.json).toHaveBeenCalledWith({ message: 'Cart cleared successfully' });
  });

  it('returns 404 when there is no cart to clear', async () => {
    Cart.findOne.mockResolvedValue(null);
    const res = mockRes();

    await controller.clearCart(req(), res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
