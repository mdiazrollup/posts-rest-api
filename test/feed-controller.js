const expect = require('chai').expect;
const sinon = require('sinon');
const User = require('../models/user');
const Post = require('../models/post');
const mongoose = require('mongoose');
const FeedController = require('../controllers/feed');

const MONGODB_URI = 'mongodb+srv://root:p4ssw0rd@cluster0.ymwtf.mongodb.net/testfeedsapp?authSource=admin&replicaSet=atlas-2kbbg6-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true';


describe('Feed Controller', () => {
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

    it('should add a created post to the posts of the creator', (done) => {
        const req = {
            userId: '5c0f66b979af55031b34728a',
            body: {
                title: 'Test Post',
                content: 'Test Post',
            },
            file: {
                path: '/pathimage'
            }
        };

        const res = {
            status: function(){
                return this;
            },
            json: function(){}
        };

        FeedController.createPost(req, res, () => {}).then((savedUser) => {
            expect(savedUser).to.have.property('posts');
            expect(savedUser.posts).to.have.length(1);
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