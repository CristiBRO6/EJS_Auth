module.exports = (sequelize, DataTypes) => {
    const UserLink = sequelize.define('UserLink', {
        id: {
            type: DataTypes.BIGINT(32),
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.BIGINT(32),
            allowNull: false,
        },
        provider: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        providerAccountId: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        removed: {
            type: DataTypes.BIGINT(32),
            allowNull: false,
            defaultValue: 0,
        },
        time: {
            type: DataTypes.BIGINT(32),
            allowNull: false,
        },
    }, {
        tableName: 'user_links',
        timestamps: false
    });

    return UserLink;
};
