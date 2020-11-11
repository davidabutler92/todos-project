require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns jons todos list', async() => {

      const expectation = [
        {
          'id': 4,
          'todo': 'make dinner for wifey and self',
          'completed': false,
          'owner_id': 2
        },
        {
          'id': 5,
          'todo': 'clean cat poop',
          'completed': false,
          'owner_id': 2
        },
        {
          'id': 6,
          'todo': 'watch netflix',
          'completed': false,
          'owner_id': 2
        }
      ];

      await fakeRequest(app)
        .post('/api/todos')
        .send({
          todo: 'make dinner for wifey and self',
          completed: false,
        })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      await fakeRequest(app)
        .post('/api/todos')
        .send({
          todo: 'clean cat poop',
          completed: false,
        })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      await fakeRequest(app)
        .post('/api/todos')
        .send({
          todo: 'watch netflix',
          completed: false,
        })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('posts a new todo and returns it', async() => {

      const response = await fakeRequest(app)
        .post('/api/todos')
        .send({
          todo: 'something new',
          completed: false
        })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual([
        {
          id: 7,
          todo: 'something new',
          completed: false,
          owner_id: 2
        }]);
    });

    test('updates a todo and returns it', async() => {

      const response = await fakeRequest(app)
        .put('/api/todos/7')
        .send({
          todo: 'something new',
          completed: true
        })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual([
        {
          id: 7,
          todo: 'something new',
          completed: true,
          owner_id: 2
        }]);
    });
  });
});
