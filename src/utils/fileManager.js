const path = require("path");
const fs = require("fs");

const clearUploadsFolder = () => {
  const directory = path.join(__dirname, "../../uploads");

  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    });
  });
};

module.exports = { clearUploadsFolder };
