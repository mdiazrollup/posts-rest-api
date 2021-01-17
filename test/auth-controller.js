const expect = require('chai').expect;
const sinon = require('sinon');
const User = require('../models/user');
const mongoose = require('mongoose');
const AuthController = require('../controllers/auth');

const MONGODB_URI = 'mongodb+srv://root:p4ssw0rd@cluster0.ymwtf.mongodb.net/testfeedsapp?authSource=admin&replicaSet=atlas-2kbbg6-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true';


describe('Auth Controller', () => {
    before((done) => {
        mongoose.connect(MONGODB_URI)
            .then(result => {
                const user = new User({
                    email: 'test@test.com',
                    password: 'test',
                    name: 'Test',
                    posts: [],
                    _id: '5c0f66b979af55031b34728a'
                });
                return user.save();
            })
            .then(() => {
                done();
            })
    });

    // Async test with mocha and chai
    it('should throw error 500 if db fails', (done) => {
        sinon.stub(User, 'findOne');
        User.findOne.throws();
        const req = {
            body: {
                email: 'test@test.com',
                password: '123456'
            }
        };

        AuthController.login(req, {}, () => { }).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 500);
            done();
        });

        User.findOne.restore();
    });

    it('should send a response with valid user status for existing user', (done) => {
        const req = { userId: '5c0f66b979af55031b34728a' };
        const res = {
            statusCode: 500,
            userStatus: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.userStatus = data.status;
            }
        };

        AuthController.getUserStatus(req, res, () => { }).then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.userStatus).to.be.equal('I am new!');
            done();
        });
    });

    after((done) => {
        // Clean db of all data before next test and disconnect from db
        User.deleteMany({})
        .then(() => {
            return mongoose.disconnect();
        })
        .then(() => {
            done();
        });
    });
});