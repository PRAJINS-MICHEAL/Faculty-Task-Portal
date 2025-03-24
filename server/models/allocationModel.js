const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnection");
const moment = require("moment");

const Allocation = sequelize.define(
    "Allocation",
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

        commonVenue: {
            type: DataTypes.STRING,
            allowNull: true,
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

        numberOfFaculty: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        skillSpecific: {
            type: DataTypes.JSON, // Store JSON array
            allowNull: true,
            get() {
                const rawValue = this.getDataValue("skillSpecific");
                return rawValue ? rawValue : [];
            },
            set(value) {
                if(value)
                this.setDataValue("skillSpecific", value);
            },
        },

        departmentSpecific: {
            type: DataTypes.JSON, // Store JSON array
            allowNull: true,
            get() {
                const rawValue = this.getDataValue("departmentSpecific");
                return rawValue ? rawValue : [];
            },
            set(value) {

                if(value)
                this.setDataValue("departmentSpecific", value);
            },
        },

        venue: {
            type: DataTypes.JSON, // Store JSON array
            allowNull: true,
            get() {
                const rawValue = this.getDataValue("venue");
                return rawValue ? rawValue : [];
            },
            set(value) {

                if(value)
                this.setDataValue("venue", value);
            },
        },

        assignedBy: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        assignedTo: {
            type: DataTypes.JSON,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue("assignedTo");
                return rawValue ? rawValue : [];
            },
            set(value) {

                if(value)
                this.setDataValue("assignedTo", value);
            },
        },

        approvalStatus: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "pending",
        },

        reason: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "pending",
        },
    },
    {
        tableName: "allocations",
        timestamps: true,
    }
);

module.exports = Allocation;
