const mysql = require('mysql');
const bcrypt = require('bcrypt');

// Create a MySQL connection
const con = mysql.createConnection({
    host: '192.168.1.153',
    user: 'capstoneUser',
    password: 'Zv935YOiwUVv',
    database: 'capstone'
});

const dbUtils = {
    login: (username, password) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT username, role, password FROM profile WHERE username = ?';

            con.query(sql, [username], (err, result) => {
                if (err) {
                    console.error("Error retrieving user from database:", err);
                    return reject("Error retrieving user from database");
                }

                if (result.length === 0) {
                    return reject("Invalid Username or Password");
                }

                const user = result[0];
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        console.error("Error comparing password:", err);
                        return reject("Error comparing password");
                    }

                    if (!isMatch) {
                        return reject("Invalid Username or Password");
                    }

                    return resolve({ username: user.username, role: user.role });
                });
            });
        });
    },

    createAccount: (username, password, role) => {
        return new Promise((resolve, reject) => {
            const saltRounds = 10;

            bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
                if (err) {
                    console.error("Error hashing password:", err);
                    return reject('Error hashing password');
                }

                const sql = `INSERT INTO profile (username, password, role) VALUES (?, ?, ?)`;
                con.query(sql, [username, hashedPassword, role], (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return reject('Username already exists');
                        } else {
                            console.error("Error saving to database:", err);
                            return reject('Error saving to database');
                        }
                    }

                    return resolve({ username: username, role: role });
                });
            });
        });
    },

    findClasses: (username, role) => {
        return new Promise((resolve, reject) => {
            let sql;

            if (role === "student") {
                sql = 'SELECT class.name FROM class, profileClass, profile WHERE profile.username = ? AND profileClass.profileName = profile.username AND class.id = profileClass.classId';
            } else if (role === "teacher") {
                sql = 'SELECT DISTINCT class.name FROM class JOIN profile ON class.teacherName = profile.username WHERE profile.username = ?';
            } else {
                return reject("Invalid role");
            }

            con.query(sql, [username], (err, result) => {
                if (err) {
                    console.error("Error retrieving classes from database:", err);
                    return reject('Error retrieving classes from database');
                }

                if (result.length === 0) {
                    return reject('No Classes Found');
                }

                const classNames = result.map(row => row.name); // Extract class names
                return resolve({ status: 'success', classes: classNames });
            });
        });
    },

    addClassConnection: (username, classId) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT class.name FROM class WHERE class.id = ?';
            con.query(sql, [classId], (err, result) => {
                if (err) {
                    console.error("Error searching database:", err);
                    return reject('Error searching database');
                }

                if (result.length === 0) {
                    return reject('Invalid Class');
                }

                const insertTableSql = 'INSERT INTO profileClass (profileName, classId) VALUES (?, ?)';
                con.query(insertTableSql, [username, classId], (err, result) => {
                    if (err) {
                        console.error("Error inserting class connection:", err);
                        return reject('Invalid ID');
                    }

                    return resolve({ status: 'success', message: 'Connection made successfully!' });
                });
            });
        });
    },

    addClass: (username, classId, className) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO class (id, name, teacherName) VALUES (?, ?, ?)`;
            con.query(sql, [classId, className, username], (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return reject('Class ID already exists');
                    } else {
                        console.error("Error saving to database:", err);
                        return reject('Error saving to database');
                    }
                }

                return resolve({ status: 'success', message: 'Class added successfully!' });
            });
        });
    },
    findAssignments: (className) => {
        return new Promise((resolve, reject) => {
            var sql = 'SELECT DISTINCT * FROM assignmnet WHERE className = ?';

            con.query(sql, [className], (err, result) => {
                if (err) {
                    console.error("Error retrieving Assignments from database:", err);
                    return reject('Error retrieving Assignments from database');
                }

                if (result.length === 0) {
                    return reject('No Assignments Found');
                }

                const assignments = result.map(row => ({
                    name: row.name,
                    id: row.id,
                    dueDate: row.dueDate,
                    grade: row.grade,
                    className: row.className
                }));
                return resolve({ status: 'success', assignments: assignments });
            });
        });
    }
};

module.exports = dbUtils;
