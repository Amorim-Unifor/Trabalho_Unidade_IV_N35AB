const request = require('supertest');
const app = require('../server');

describe('Converter Backend API', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(jasmine.objectContaining({ status: 'ok' }));
    expect(response.body.time).toBeDefined();
  });

  it('should convert 100 meters to miles', async () => {
    const response = await request(app)
      .post('/api/convert')
      .send({ from: 'm', to: 'mi', value: 100 });

    expect(response.status).toBe(200);
    expect(response.body.result).toBeCloseTo(0.062137, 6);
    expect(response.body.expression).toContain('100 m =');
  });

  it('should return 400 for invalid unit', async () => {
    const response = await request(app)
      .post('/api/convert')
      .send({ from: 'm', to: 'xx', value: 100 });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Unidades inválidas');
  });
});
