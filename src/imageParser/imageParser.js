const path = require("path");
const Jimp = require("jimp");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "tmp",
  filename: function (req, file, cb) {
    const ext = path.parse(file.originalname).ext;
    cb(null, req.user._id + "-" + Date.now() + ext);
  },
});

const upload = multer({ storage });

async function imageParser(req, res, next) {
  try {
    const { filename, path: draftPath } = req.file;
    Jimp.read(draftPath, (err, img) => {
      if (err) throw err;
      img.resize(250, 250).quality(100).write(`public/avatars/${filename}`);
    });

    req.user.avatarURL = `avatars/${filename}`;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports.imageParser = imageParser;
module.exports.upload = upload;
