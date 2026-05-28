describe('Converter Backend API', () => {
  beforeEach(() => {
    cy.request('GET', '/api/health').as('health');
  });

  it('should return health status', () => {
    cy.get('@health').then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('status', 'ok');
      expect(response.body).to.have.property('time');
    });
  });

  it('should convert 100 meters to miles', () => {
    cy.request('POST', '/api/convert', {
      from: 'm',
      to: 'mi',
      value: 100,
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('result');
      expect(response.body.result).to.be.closeTo(0.062137, 0.000001);
      expect(response.body).to.have.property('expression', '100 m = 0.0621371192237334 mi');
    });
  });

  it('should return 400 for invalid unit', () => {
    cy.request({
      method: 'POST',
      url: '/api/convert',
      body: { from: 'abc', to: 'km', value: 1 },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
    });
  });
});
