const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/dbConnection"); // Ensure this is correctly configured

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        department: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "user",
        },
        skills: {
            type: DataTypes.TEXT, // Store JSON string
            allowNull: true,
            get() {
                // Convert JSON string to array when retrieving
                const rawValue = this.getDataValue("skills");
                return rawValue ? JSON.parse(rawValue) : [];
            },
            set(value) {
                // Convert array to JSON string when saving
                this.setDataValue("skills", JSON.stringify(value));
            },
        },
    },
    {
        tableName: "users",
        timestamps: true,
    }
);

module.exports = User;
