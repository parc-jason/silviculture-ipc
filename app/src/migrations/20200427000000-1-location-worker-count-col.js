module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'location',
          'numberOfWorkers',
          {
            allowNull: false,
            comment: 'Number of all workers at a location',
            type: Sequelize.INTEGER,
            defaultValue: 0,
            unique: false
          },
          {transaction: t})
      ]);
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn(
          'location',
          'numberOfWorkers',
          {transaction: t})
      ]);
    });
  }
};
