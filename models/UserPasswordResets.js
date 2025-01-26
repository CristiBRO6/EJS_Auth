module.exports = (sequelize, DataTypes) => {
    const UserPasswordReset = sequelize.define('UserPasswordReset', {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        token: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        used: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        expire: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        removed: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        time: {
            type: DataTypes.BIGINT,
            allowNull: false
        }
    }, {
        tableName: 'user_password_resets',
        timestamps: false
    });

    return UserPasswordReset;
};
