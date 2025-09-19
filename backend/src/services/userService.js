// In-memory user storage (replace with real database in production)
let users = [
  {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    // password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj62LN26MiJC', 
     password : '$2a$12$r0ml0CIKT.wfmF/U60bTqelnj0CfEXRriHSEc61/Kn3Db.CLkZnvS',// password123
    createdAt: new Date().toISOString()
  }
];

let nextUserId = 2;

class UserService {
  static getAllUsers() {
    return users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    }));
  }

  static findUserByEmail(email) {
    return users.find(user => user.email === email);
  }

  static findUserByUsername(username) {
    return users.find(user => user.username === username);
  }

  static findUserById(id) {
    return users.find(user => user.id === parseInt(id));
  }

  static createUser(userData) {
    const newUser = {
      id: nextUserId++,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  static emailExists(email) {
    return users.some(user => user.email === email);
  }

  static usernameExists(username) {
    return users.some(user => user.username === username);
  }

  static getUserCount() {
    return users.length;
  }
}

module.exports = UserService;
