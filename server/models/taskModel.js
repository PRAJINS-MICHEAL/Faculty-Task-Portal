const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnection");
const User = require("./userModel");

const Task = sequelize.define(
    "Task",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        task: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        venue: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fromTime: {
            type: DataTypes.DATE,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue("fromTime");
                return rawValue ? moment(rawValue).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") : null;
            }
        },
        toTime: {
            type: DataTypes.DATE,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue("toTime");
                return rawValue ? moment(rawValue).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") : null;
            }
        },
        assignedTo: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: "id" },
        },
        assignedBy: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "tasks",
        timestamps: true,
    }
);


module.exports = Task;
