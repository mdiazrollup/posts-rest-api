const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const authMiddleware = require('../middleware/is-auth');

describe('Auth middleware', () => {
    it('should throw error if no authorization header is present', () => {
        const req = {
            get: (headerName) => null
        };
    
        expect(authMiddleware.bind(this, req, {}, ()=>{})).to.throw('Not authenticated');
    });
    
    it('should throw error if the authorization header is only one string', () => {
        const req = {
            get: (headerName) => 'xyz'
        };
        expect(authMiddleware.bind(this, req, {}, ()=>{})).to.throw();
    });

    it('should throw an error if the token cannot be verified', () => {
        const req = {
            get: (headerName) => 'Bearer xyz'
        };
        expect(authMiddleware.bind(this, req, {}, ()=>{})).to.throw();
    });

    it('should yield a userId if the token is verified', () => {
        const req = {
            get: (headerName) => 'Bearer sdfsdfdsfsdfsdfsd'
        };
        sinon.stub(jwt, 'verify'); // mock function from the library
        jwt.verify.returns({userId: 'abc'});
        authMiddleware(req, {}, () => {});
        expect(req).to.have.property('userId');
        expect(req).to.have.property('userId', 'abc');
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore();
    })
});