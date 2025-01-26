module.exports = (sequelize, DataTypes) => {
    const EmailVerification = sequelize.define('EmailVerification', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        token: {
            type: DataTypes.STRING(128),
            allowNull: false,
            collate: 'latin1_swedish_ci' // Apply the collation
        },
        used: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        code: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        expire: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: -1
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
        tableName: 'email_verification',
        timestamps: false 
    });

    return EmailVerification;
};
