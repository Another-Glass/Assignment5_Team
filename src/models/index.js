const Sequelize = require('sequelize');
const configs = require('../configs');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
// const Op = Sequelize.Op;

let sequelize;

if (JSON.parse(configs.db.isSqlite)) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '../database.db',
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    configs.db.dbDATABASE,
    configs.db.dbUSERNAME,
    configs.db.dbPASSWORD,
    {
      host: configs.db.dbHOSTNAME,
      port: configs.db.dbPORT,
      dialect: 'mysql',
      logging: false,
    },
  );
}

const modules = {};
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    modules[model.name] = model;
  });

Object.keys(modules).forEach(modelName => {
  if (modules[modelName].associate) {
    modules[modelName].associate(modules);
  }
});

modules.sequelize = sequelize;
modules.Sequelize = Sequelize;

if (process.env.NODE_ENV !== 'test') {
  modules.sequelize
    .sync()
    .then(() => {
      logger.log('DB connected ...');
    })
    .catch(err => {
      logger.log('DB connection failed: ' + err);
    });
}

module.exports = modules;
