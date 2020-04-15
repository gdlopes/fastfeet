import Sequelize, { Model } from 'sequelize';

class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        zipCode: Sequelize.STRING,
        city: Sequelize.STRING,
        state: Sequelize.STRING,
        complement: Sequelize.STRING,
        street: Sequelize.STRING,
        number: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default Recipient;
