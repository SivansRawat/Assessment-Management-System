const bcrypt = require('bcryptjs');

bcrypt.hash('password123', 12, (err, hash) => {
  if (err) throw err;
  console.log(hash);  // Copy the output hash
});
