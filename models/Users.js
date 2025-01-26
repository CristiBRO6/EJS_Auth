module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        verified: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true
        },
        role: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        password: {
            type: DataTypes.STRING(128),
            allowNull: true
        },
        avatar: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: '0'
        },
        time: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: Date.now
        },
    }, {
        tableName: 'users',
        timestamps: false
    });

    return User;
};